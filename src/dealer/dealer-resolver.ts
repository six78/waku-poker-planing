import { appConfig } from '../app/app.config';
import { IAppState } from '../app/app.state';
import { IRoomState, RoomId } from '../room/room.model';
import { getFromLocalStorage, saveToLocalStorage } from '../shared/local-storage';
import { toArray, toDictionary } from '../shared/object';
import { Sort, getSortFn } from '../shared/sorting';
import { getCurrentTimestamp } from '../shared/timestamp';

// TODO: bad file naming

export function createDefaultAppState(): IAppState {
  return {
    players: [],
    issues: [],
    activeIssue: null,
    votesRevealed: false
  }
}

type IDealerRoomsList = Record<RoomId, IRoomState>;

const STORAGE_KEY = 'DEALER';

export function isCurrentUserDealerForRoom(roomId: RoomId): boolean {
  const rooms = getDealerRooms();
  return rooms[roomId] !== undefined;
}

export function getRoomState(roomId: RoomId): IRoomState {
  const rooms = getDealerRooms();
  return rooms[roomId] ?? createDefaultAppState();
}

export function createEmptyRoom(roomId: RoomId): void {
  saveRoomState(roomId, createDefaultAppState());
}

export function saveRoomState(roomId: RoomId, state: IAppState): void {
  const rooms = getDealerRooms();
  rooms[roomId] = {
    ...state,
    updatedAt: getCurrentTimestamp()
  };
  saveToLocalStorage(STORAGE_KEY, rooms);
}

export function getDealerRooms(): IDealerRoomsList {
  return getFromLocalStorage<IDealerRoomsList>(STORAGE_KEY) || {};
}

export function cleanUpDealerRoomHistory() {
  const rooms = toArray(getDealerRooms());
  const sortedRooms = rooms.sort(getSortFn<IRoomState>("updatedAt", Sort.Desc))
  const roomsToStore = sortedRooms.slice(0, appConfig.maxRoomsToStoreByDealer);
  saveToLocalStorage(STORAGE_KEY, toDictionary(roomsToStore, '__key'));
}