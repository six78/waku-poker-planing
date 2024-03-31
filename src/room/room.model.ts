import { IAppState } from '../app/app.state';

export type RoomId = string;
export interface IRoomState extends IAppState {
  updatedAt: number;
}
