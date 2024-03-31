import base58 from 'bs58';
import { keccak256 } from 'js-sha3';
import { randomBytes } from '@waku/message-encryption/crypto';
import { RoomId } from './room.model';
import { uint8ArrayToHexStr } from '../shared/string';
import { appConfig } from '../app/app.config';


export class RoomConfig {
  public readonly id: RoomId;
  public readonly symmetricKey: Uint8Array;
  public readonly contentTopic: string;

  constructor(roomId?: RoomId) {
    if (!roomId) {
      this.symmetricKey = this.generateSymmetricKey();
      const symmetricKeyWithAppVersion = this.getSymmetricKeyWithAppVersion(this.symmetricKey);
      this.id = base58.encode(symmetricKeyWithAppVersion);
      this.contentTopic = this.getContentTopic(symmetricKeyWithAppVersion);

      return;
    }

    this.id = roomId;
    const symmetricKeyWithAppVersion = base58.decode(roomId);
    const appVersion = symmetricKeyWithAppVersion[0];

    if (appVersion !== appConfig.version) {
      throw new Error('Wrong versions TODO:');
    }

    this.symmetricKey = symmetricKeyWithAppVersion.slice(1);
    this.contentTopic = this.getContentTopic(symmetricKeyWithAppVersion);
  }

  public static create(roomId?: RoomId): RoomConfig {
    return new RoomConfig(roomId);
  }

  private getContentTopic(symmetricKeyWithAppVersion: Uint8Array): string {
    const hasher = keccak256.create();
    hasher.update(symmetricKeyWithAppVersion);

    const hash = uint8ArrayToHexStr(Uint8Array.from(hasher.digest()));
    const contentTopicName = hash.slice(2, 10);

    return `/six78/${appConfig.version}/${contentTopicName}/json`;
  }

  private getSymmetricKeyWithAppVersion(symmetricKey: Uint8Array): Uint8Array {
    const result = new Uint8Array(1 + symmetricKey.length);
    result.set([appConfig.version]);
    result.set(symmetricKey, 1);
    return result;
  }

  private generateSymmetricKey(): Uint8Array {
    return randomBytes(16);
  }
}

