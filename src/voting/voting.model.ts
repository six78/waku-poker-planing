import { PlayerId } from '../player/player.model';

export type Estimation = string;

export interface IVote {
  timestamp: number;
  estimation: Estimation | null;
}

export interface IPlayerVote extends IVote {
  voteBy: PlayerId;
}