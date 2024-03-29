import { appConfig } from './app.config';
import base58 from 'bs58';
import { keccak256 } from 'js-sha3';
import { randomBytes } from '@waku/message-encryption/crypto';


// TODO: rename to Room 
export class Moh {
  public generate() {
    const symmetricKey = this.generateSymmetricKey();
    const symmetricKeyWithAppVersion = this.getSymmetricKeyWithAppVersion(symmetricKey)
    const roomId = this.toBase58(symmetricKeyWithAppVersion);

    const hasher = keccak256.create();
    hasher.update(symmetricKeyWithAppVersion);

    // const hash = uint8ArrayToHexStr(Uint8Array.from(hasher.digest()));
    // console.log(hash, test.hashHexEncoded)

    // const contentTopicName = hash.slice(2, 10);

    return roomId;
  }


  private toBase58(data: Uint8Array): string {
    return base58.encode(data)
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

