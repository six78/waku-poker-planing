import { IPlayerVoteMessage } from '../app/app-waku-message.model';
import { IAppState } from '../app/app.state';
import { getCurrentTimestamp } from '../shared/timestamp';
import { Estimation, IVote } from '../voting/voting.model';
import { WakuNodeService } from '../waku/waku-node.service';
import { IPlayer, PlayerId, PlayerName } from './player.model';


export class PlayerService {
  public readonly playerId: PlayerId;
  public readonly playerName: PlayerName;

  constructor(private readonly node: WakuNodeService, player: IPlayer) {
    this.playerId = player.id;
    this.playerName = player.name;

    this.sendPlayerIsOnlineMessage();
  }

  public vote(voteFor: string, voteResult: Estimation | null): Omit<IVote, "voteBy"> {
    const timestamp = getCurrentTimestamp();

    const message: IPlayerVoteMessage = {
      type: '__player_vote',
      voteFor,
      vote: {
        timestamp,
        voteBy: this.playerId,
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

  public enableHeartBeat(): this {
    setInterval(() => {
      this.sendPlayerIsOnlineMessage()
    }, 10 * 1000);

    return this;
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