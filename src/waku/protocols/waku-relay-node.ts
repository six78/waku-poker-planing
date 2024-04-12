import {
  Callback, IDecodedMessage, IDecoder, IEncoder, IMessage, Libp2p, Protocols, RelayNode, SendResult, Unsubscribe, createNode, waitForRemotePeer
} from '@waku/sdk';
import { appConfig } from '../../app/app.config';
import { IWakuNode } from '../waku.model';

export class WakuRelayNode implements IWakuNode {
  public readonly libp2p: Libp2p;
  constructor(private readonly node: RelayNode) {
    this.libp2p = node.libp2p;
  }

  public send(encoder: IEncoder, message: IMessage): Promise<SendResult> {
    return this.node.relay.send(encoder, message);
  }

  public subscribe<T extends IDecodedMessage>(decoders: IDecoder<T> | IDecoder<T>[], callback: Callback<T>)
    : Unsubscribe | Promise<Unsubscribe> {
    return this.node.relay.subscribe(decoders, callback);
  }

  public stop(): void {
    this.node.stop();
  }

  public static async create(): Promise<IWakuNode> {
    const node = await createNode({

      emitSelf: true,
      bootstrapPeers: appConfig.waku.peers,
      // libp2p: {
      //   peerDiscovery: [
      //     wakuDnsDiscovery(
      //       appConfig.waku.enrtree,
      //     ),
      //   ],
      // },
    });

    await node.start();
    await waitForRemotePeer(node, [
      Protocols.Relay
    ]);

    return new WakuRelayNode(node);
  }
}