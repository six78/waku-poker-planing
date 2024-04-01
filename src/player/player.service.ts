import { IPlayerVoteMessage } from '../app/app-waku-message.model';
import { appConfig } from '../app/app.config';
import { IAppState } from '../app/app.state';
import { getCurrentTimestamp } from '../shared/timestamp';
import { Estimation, IVote } from '../voting/voting.model';
import { IWakuService } from '../waku/waku.model';
import { IPlayer, PlayerId, PlayerName } from './player.model';


export class PlayerService {
  public readonly playerId: PlayerId;
  public readonly playerName: PlayerName;

  private heartbeatIntervalId: NodeJS.Timeout | undefined;

  constructor(private readonly node: IWakuService, player: IPlayer) {
    this.playerId = player.id;
    this.playerName = player.name;

    this.sendPlayerIsOnlineMessage();
    this.enableHeartBeat();
  }

  public vote(voteFor: string, voteResult: Estimation | null): IVote {
    const timestamp = getCurrentTimestamp();

    const message: IPlayerVoteMessage = {
      type: '__player_vote',
      issue: voteFor,
      playerId: this.playerId,
      vote: {
        timestamp,
        estimation: voteResult,
      }
    };

    this.node.send(message);

    return {
      timestamp,
      estimation: voteResult
    }
  }

  public onStateChanged(callback: (state: IAppState) => void): this {
    this.node.subscribe(message => {
      if (message.type === '__state') {
        console.log('trying apply state', message.state);
        callback(message.state);
      }
    })

    return this;
  }

  private enableHeartBeat(): void {
    if (!appConfig.heartbeat.player) {
      return;
    }

    if (!this.heartbeatIntervalId) {
      this.heartbeatIntervalId = setInterval(() => {
        this.sendPlayerIsOnlineMessage()
      }, 10 * 1000);
    }
  }

  public beforeDestroy(): void {
    clearInterval(this.heartbeatIntervalId);
    this.node.stop();
  }

  private sendPlayerIsOnlineMessage(): void {
    const player: IPlayer = {
      id: this.playerId,
      name: this.playerName,
    }

    this.node.send({
      type: '__player_online',
      player,
    });
  }
}