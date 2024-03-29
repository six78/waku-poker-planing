export function uint8ArrayToHexStr(data: Uint8Array) {
  return data.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '0x');
}

export function hexStrToUint8Array(hexString: string) {
  hexString = hexString.slice(2);

  const uint8Array = new Uint8Array(hexString.length / 2);

  for (let i = 0, j = 0; i < hexString.length; i += 2, j++) {
    uint8Array[j] = parseInt(hexString.substr(i, 2), 16);
  }

  return uint8Array;
}
