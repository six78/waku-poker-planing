import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { IPlayer } from '../player/player.model';
import { IIssue, IssueId } from '../issue/issue.model';

export interface IAppState {
  players: IPlayer[];
  issues: IIssue[];
  activeIssue: IssueId | null;
  votesRevealed: boolean;
}


const appState = atom<IAppState | null>({
  key: 'appState',
  default: null
});

// TODO: bad naming
export const useAppState = () => useRecoilValue(appState)!;
export const useUpdateAppState = () => useRecoilState(appState);

export const useIssuesList = () => {
  const { issues } = useAppState();
  return issues;
}

export const useActiveIssue = () => {
  const { issues, activeIssue } = useAppState();
  if (!activeIssue) {
    return null;
  }

  return issues.find(issue => issue.id === activeIssue) || null;
}

export const usePlayersList = () => {
  const { players } = useAppState();
  return players;
}
