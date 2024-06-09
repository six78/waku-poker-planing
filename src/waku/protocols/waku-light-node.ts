import { Callback, IDecodedMessage, IDecoder, IEncoder, IMessage, Libp2p, LightNode, Protocols, SendResult, Unsubscribe, createLightNode, waitForRemotePeer } from '@waku/sdk';
import { wakuDnsDiscovery } from "@waku/dns-discovery";
import { appConfig } from '../../app/app.config';
import { IWakuNode } from '../waku.model';

export class WakuLightNode implements IWakuNode {
  public readonly libp2p: Libp2p;

  constructor(private readonly node: LightNode) {
    this.libp2p = node.libp2p;
  }

  public send(encoder: IEncoder, message: IMessage): Promise<SendResult> {
    return this.node.lightPush.send(encoder, message);
  }

  public subscribe<T extends IDecodedMessage>(decoders: IDecoder<T> | IDecoder<T>[], callback: Callback<T>)
    : Unsubscribe | Promise<Unsubscribe> {
    console.log("<<< lightnode.subscribe")
    return this.node.filter.subscribe(decoders, callback);
  }

  public stop(): void {
    this.node.stop();
  }

  public static async create(): Promise<IWakuNode> {
    const node = await createLightNode({
      bootstrapPeers: appConfig.waku.peers,
      // libp2p: {

      //   peerDiscovery: [
      //     wakuDnsDiscovery(
      //       appConfig.waku.enrtree,
      //       {
      //         lightPush: 3,
      //         filter: 3,
      //       }),
      //   ],
      // },
    });

    console.log('CREATED');

    await node.start();
    console.log('STARTED');
    await waitForRemotePeer(node, [
      Protocols.LightPush,
      Protocols.Filter,
    ]);

    console.log('WAITING');


    return new WakuLightNode(node);
  }
}