import { RoomId } from './../room/room.model';
import { LogLevel } from './../app/app.const';
import { Decoder, Encoder, createDecoder, createEncoder } from '@waku/sdk';
import { IMessage } from '../app/app-waku-message.model';
import { appConfig } from '../app/app.config';
import { PUBSUB_TOPIC } from '../app/app.const';
import { IWakuNode, IWakuService } from './waku.model';
import { WakuRelayNode } from './protocols/waku-relay-node';
import { WakuLightNode } from './protocols/waku-light-node';
import { useEffect, useMemo, useState } from 'react';
import { RoomConfig } from '../room/room';

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


// TODO: implement this fn
export function useWakuNodeService(roomId: RoomId): IWakuService | null {
  const [node, setNode] = useState<IWakuService | null>(null);
  const roomConfig = useMemo(() => RoomConfig.create(roomId), [roomId]);

  useEffect(() => {
    WakuNodeService.create(roomConfig.contentTopic).then(setNode);
  }, [roomConfig]);

  return node;
}

export class WakuNodeService implements IWakuService {
  private readonly encoder: Encoder;
  private readonly decoder: Decoder;
  private readonly utf8Encoder = new TextEncoder();
  private readonly utf8Decoder = new TextDecoder();

  private readonly callbacks: ((message: IMessage) => void)[] = [];

  constructor(

    private readonly node: IWakuNode,
    contentTopic: string,
  ) {
    this.encoder = createEncoder({ contentTopic, pubsubTopic: PUBSUB_TOPIC, ephemeral: true });
    this.decoder = createDecoder(contentTopic, PUBSUB_TOPIC);

    this.initSubscription();
    // TODO: add connection:close libp2p handler
  }

  public static async create(contentTopic: string): Promise<IWakuService> {
    const createFn = {
      'relay': WakuRelayNode.create,
      'light': WakuLightNode.create,
    }[appConfig.waku.protocol];

    const node = await createFn();
    return new WakuNodeService(node, contentTopic);
  }

  private async initSubscription(): Promise<void> {
    console.log("<<< initSubscription")
    await this.node.subscribe([this.decoder], rawMessage => {
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

    this.node.send(this.encoder, {
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