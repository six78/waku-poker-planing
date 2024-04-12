import { LogLevel } from './app.const';

interface IAppConfig {
  version: number,
  logLevel: LogLevel,
  maxRoomsToStoreByDealer: number,
  waku: {
    debug: boolean,
    protocol: 'light' | 'relay',
    enrtree: string[]
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
    debug: false,
    protocol: 'relay',
    enrtree: ["enrtree://ANEDLO25QVUGJOUTQFRYKWX6P4Z4GKVESBMHML7DZ6YK4LGS5FC5O@prod.wakuv2.nodes.status.im"]
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
