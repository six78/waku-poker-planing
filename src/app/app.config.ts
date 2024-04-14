import { LogLevel } from './app.const';

interface IAppConfig {
  version: number,
  logLevel: LogLevel,
  maxRoomsToStoreByDealer: number,
  waku: {
    debug: boolean,
    protocol: 'light' | 'relay',
    enrtree: string[],
    peers: string[]
  },
  heartbeat: {
    player: boolean,
    dealer: boolean
  }
}

export const appConfig: IAppConfig = {
  version: 1,
  logLevel: LogLevel.None,
  maxRoomsToStoreByDealer: 5,
  waku: {
    debug: true,
    protocol: 'light',
    enrtree: [],
    peers: [
      // wakuv2.test from https://fleets.waku.org/
      "/dns4/node-01.do-ams3.wakuv2.test.status.im/tcp/8000/wss/p2p/16Uiu2HAmPLe7Mzm8TsYUubgCAW1aJoeFScxrLj8ppHFivPo97bUZ",
      "/dns4/node-01.gc-us-central1-a.wakuv2.test.status.im/tcp/8000/wss/p2p/16Uiu2HAmJb2e28qLXxT5kZxVUUoJt72EMzNGXB47Rxx5hw3q4YjS",
      "/dns4/node-01.ac-cn-hongkong-c.wakuv2.test.status.im/tcp/8000/wss/p2p/16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm"
    ],
  },
  heartbeat: {
    player: false,
    dealer: false
  }
}

if (appConfig.waku.debug) {
  localStorage.setItem('debug', '*')
} else {
  localStorage.removeItem('debug')
}
