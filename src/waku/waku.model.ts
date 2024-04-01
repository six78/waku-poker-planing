import { IReceiver, ISender, Libp2p } from '@waku/sdk';
import { IMessage } from '../app/app-waku-message.model';

export interface IWakuNode extends ISender, Pick<IReceiver, 'subscribe'> {
  libp2p: Libp2p;
  stop(): void;
}

export interface IWakuService {
  stop(): void;
  send(message: IMessage): void;
  subscribe(callback: (message: IMessage) => void): void;
}