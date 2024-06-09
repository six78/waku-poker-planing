import { Callback, IDecodedMessage, IDecoder, IEncoder, IMessage, Libp2p, LightNode, Protocols, SDKProtocolResult, Unsubscribe, createLightNode, waitForRemotePeer } from '@waku/sdk';
import { wakuDnsDiscovery } from "@waku/dns-discovery";
import { appConfig } from '../../app/app.config';
import { IWakuNode } from '../waku.model';
import { getAppSettings } from '../../settings/settings.storage';

export class WakuLightNode implements IWakuNode {
  public readonly libp2p: Libp2p;

  constructor(private readonly node: LightNode) {
    this.libp2p = node.libp2p;
  }

  public send(encoder: IEncoder, message: IMessage): Promise<SDKProtocolResult> {
    return this.node.lightPush.send(encoder, message);
  }

  public subscribe<T extends IDecodedMessage>(decoders: IDecoder<T> | IDecoder<T>[], callback: Callback<T>)
    : Unsubscribe | Promise<Unsubscribe> {
    return this.node.filter.subscribe(decoders, callback);
  }

  public stop(): void {
    this.node.stop();
  }

  public static async create(): Promise<IWakuNode> {
    const settings = getAppSettings();
    const peers = settings.node ? [settings.node] : appConfig.waku.peers

    const node = await createLightNode({
      defaultBootstrap: true
     // bootstrapPeers: peers,

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

    console.log('CONNECTING TO NODE', peers);

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