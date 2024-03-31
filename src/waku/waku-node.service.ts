import { LogLevel } from './../app/app.const';
import { Callback, Decoder, Encoder, IDecodedMessage, IDecoder, IEncoder, IFilter, ILightPush, IMessage as IWakuMessage, Protocols, SendResult, Unsubscribe, createDecoder, createEncoder, createLightNode, waitForRemotePeer } from '@waku/sdk';
import { wakuDnsDiscovery } from "@waku/dns-discovery";
import { IMessage } from '../app/app-waku-message.model';
import { appConfig } from '../app/app.config';
import { PUBSUB_TOPIC } from '../app/app.const';

export const MESSAGE = {
  STATE: '__state',
  PLAYER_ONLINE: '__player_online',
  PLAYER_VOTED: '__player_vote'
}

// TODO: this file is to big
const logLevel = new Map<LogLevel, string[]>();
logLevel.set(LogLevel.None, []);
logLevel.set(LogLevel.State, [MESSAGE.STATE]);
logLevel.set(LogLevel.All, [MESSAGE.STATE, MESSAGE.PLAYER_ONLINE, MESSAGE.PLAYER_VOTED]);


interface IWakuLightNode {
  filter: Pick<IFilter, 'subscribe'>,
  lightPush: Pick<ILightPush, 'send'>,
  stop: () => void
}

class WakuFakeLightNode implements IWakuLightNode {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private subscribe: <T extends IDecodedMessage>(decoders: IDecoder<T> | IDecoder<T>[], callback: Callback<T>) => Unsubscribe | Promise<Unsubscribe> = (_, __) => () => new Promise(r => r());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private send: (encoder: IEncoder, message: IWakuMessage) => Promise<SendResult> = (_, __) => new Promise(resolve => resolve({
    recipients: []
  }))

  public filter = {
    subscribe: this.subscribe
  }

  public lightPush = {
    send: this.send
  };

  public stop() {

  }
}

export async function createWakuNodeService(contentTopic: string): Promise<WakuNodeService> {
  if (appConfig.fakeNode) {
    return new Promise(r => r(new WakuNodeService(new WakuFakeLightNode(), contentTopic)))
  }

  let step: string = 'CREATING NODE';

  const timeout = setTimeout(() => {
    console.warn(`Too long waiting for node instance on step ${step}`)
  }, 8000);

  const node = await createLightNode({
    libp2p: {
      peerDiscovery: [
        wakuDnsDiscovery(
          ["enrtree://ANEDLO25QVUGJOUTQFRYKWX6P4Z4GKVESBMHML7DZ6YK4LGS5FC5O@prod.wakuv2.nodes.status.im"],
          {
            lightPush: 3,
            filter: 3,
          }),
      ],
    },
  });
  step = 'NODE CREATED, STARTING...'
  await node.start();
  step = 'NODE STARTED, WAITING FOR PEARS...';
  await waitForRemotePeer(node, [
    Protocols.LightPush,
    Protocols.Filter,
  ]);

  const sidr = [
    'connection:close',
    'connection:open',
    'connection:prune',
    'peer:connect',
    'peer:disconnect',
    'peer:discovery',
    'peer:identify',
    'peer:update',
    'self:peer:update',
    'start',
    'stop',
    'transport:close',
    'transport:listening',
  ]

  sidr.forEach(event => {
    node.filter.addLibp2pEventListener(event, e => console.warn(event, e));
  })

  clearTimeout(timeout);
  return new WakuNodeService(node, contentTopic);
}

export class WakuNodeService {
  private readonly encoder: Encoder;
  private readonly decoder: Decoder;
  private readonly utf8Encoder = new TextEncoder();
  private readonly utf8Decoder = new TextDecoder();

  private readonly callbacks: ((message: IMessage) => void)[] = [];

  constructor(

    private readonly node: IWakuLightNode,
    contentTopic: string,
  ) {
    this.encoder = createEncoder({ contentTopic, pubsubTopic: PUBSUB_TOPIC, ephemeral: true });
    this.decoder = createDecoder(contentTopic, PUBSUB_TOPIC);

    this.initSubscription();
  }

  private async initSubscription(): Promise<void> {
    await this.node.filter.subscribe([this.decoder], rawMessage => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = JSON.parse(this.decodeUtf8((rawMessage as any).proto.payload)) as IMessage;
      const messagesToLog = logLevel.get(appConfig.logLevel) || [];
      if (messagesToLog.includes(message.type)) {
        console.log('RECEIVED', message);
      }
      this.callbacks.forEach(x => x(message));
    })
  }

  public send(message: IMessage): void {
    console.log('SENDING', message);

    this.node.lightPush.send(this.encoder, {
      payload: this.encodeUtf8(JSON.stringify(message))
    })
  }

  public subscribe(callback: (message: IMessage) => void): void {
    this.callbacks.push(callback);
  }

  public stop(): void {
    this.node.stop();
  }

  private encodeUtf8(message: string): Uint8Array {
    return this.utf8Encoder.encode(message);
  }

  private decodeUtf8(message: Uint8Array): string {
    return this.utf8Decoder.decode(message);
  }
}