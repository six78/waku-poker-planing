import { getFromLocalStorage, saveToLocalStorage } from '../shared/local-storage';
import { IAppSettings } from './settings.model';

const LOCAL_STORAGE_KEY = 'app-settings';

export function saveAppSettings(settings: IAppSettings): void {
  saveToLocalStorage(LOCAL_STORAGE_KEY, settings);
}

export function getAppSettings(): IAppSettings {
  const settings = getFromLocalStorage<IAppSettings>(LOCAL_STORAGE_KEY);
  return settings ?? {
    node: undefined
  }
}