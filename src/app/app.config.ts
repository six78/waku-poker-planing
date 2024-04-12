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
    enrtree: ["enrtree://ANEDLO25QVUGJOUTQFRYKWX6P4Z4GKVESBMHML7DZ6YK4LGS5FC5O@prod.wakuv2.nodes.status.im"],
    peers: [
      "/ip4/0.0.0.0/tcp/60002/ws/p2p/16Uiu2HAkzjwwgEAXfeGNMKFPSpc6vGBRqCdTLG5q3Gmk2v4pQw7H",
      "/ip4/0.0.0.0/tcp/60003/ws/p2p/16Uiu2HAmFBA7LGtwY5WVVikdmXVo3cKLqkmvVtuDu63fe8safeQJ",
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
