import { LogLevel } from './app.const';

export const appConfig = {
  version: 1, // TODO: strongly typed bytes
  fakeNode: false,
  logLevel: LogLevel.None,
  maxRoomsToDisplay: 5
}
