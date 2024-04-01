import { IIssue, IssueId } from '../issue/issue.model';
import { IPlayerOnlineMessage, IPlayerVoteMessage } from '../app/app-waku-message.model';
import { IAppState } from '../app/app.state';
import { Estimation } from '../voting/voting.model';
import { RoomId } from '../room/room.model';
import { getRoomState, saveRoomState } from './dealer-resolver';
import { IWakuService } from '../waku/waku.model';


// TODO: why this decorator not working?
// function NetworkSync(target: DealerService, _propertyKey: string, descriptor: PropertyDescriptor) {
//   const originalMethod = descriptor.value;

//   descriptor.value = function (...args: unknown[]) {
//     console.log('CALLING', descriptor);
//     const result = originalMethod.apply(target, args);
//     console.log('after function call');
//     // target.sendStateToNetwork();
//     return result;
//   };
// }



export class DealerService {
  private state: IAppState;
  private syncIntervalId: NodeJS.Timeout | undefined;

  constructor(private readonly node: IWakuService, private readonly roomId: RoomId) {
    this.state = getRoomState(roomId);

    this.node.subscribe(message => {
      switch (message.type) {
        case '__player_online':
          this.onPlayerOnline(message);
          break;
        case '__player_vote':
          this.onPlayerVoted(message);
          break;
      }
    })

    // const playersOnlineStream$ = new Subject<IPlayer>();


    // playersOnlineStream$.pipe(
    //   // Для каждого сообщения от игрока
    //   mergeMap(player => {
    //     const players = this.state.players;

    //     if (!players.some(x => x.id === player.id)) {
    //       this.state.players.push(player);
    //       this.sendStateToNetwork();
    //     }
    //     // Создаем таймер на 15 секунд для текущего игрока
    //     return timer(15000).pipe(
    //       map(() => player.id),
    //       // Если от игрока приходит новое сообщение, отменяем текущий таймер
    //       takeUntil(playersOnlineStream$.pipe(
    //         filter(x => x.id === player.id)
    //       )),
    //     );
    //   }),
    // ).subscribe(playerId => {

    //   const players = this.state.players;
    //   if (players.some(x => x.id === playerId)) {
    //     console.log('PLAYER OFFLINE', playerId);
    //     this.state.players = this.state.players.filter(x => x.id !== playerId);
    //     this.sendStateToNetwork();
    //   }
    // });

    this.sendStateToNetwork();
    this.enableIntervalSync();
  }

  public startVoting(issue: IIssue): void {
    this.state.activeIssue = issue.id;
    const activeIssue = this.findActiveIssue();
    if (activeIssue) {
      activeIssue.result = null;
      activeIssue.votes = {};
    }

    this.sendStateToNetwork();
  }

  public reveal(): void {
    if (!this.state.activeIssue) {
      return;
    }

    this.state.votesRevealed = true;
    this.sendStateToNetwork();

  }

  public submitResult(result: Estimation): void {
    const activeIssue = this.findActiveIssue();

    if (activeIssue) {
      activeIssue.result = result;
    }

    this.state.votesRevealed = false;
    this.state.activeIssue = null;
    this.sendStateToNetwork();
  }

  public revote(): void {
    const activeIssue = this.findActiveIssue();

    if (activeIssue) {
      activeIssue.result = null;
      activeIssue.votes = {};
    }

    this.state.votesRevealed = false;
    this.sendStateToNetwork();
  }

  public addIssue(issue: IIssue): void {
    this.state.issues.push(issue);
    this.sendStateToNetwork();
  }

  public removeIssue(issueId: IssueId): void {
    this.state.issues = this.state.issues.filter(x => x.id !== issueId);
    this.sendStateToNetwork();
  }

  public sendStateToNetwork(): void {
    let state = this.state;

    const shouldHideResults = state.votesRevealed === false && state.activeIssue;

    if (shouldHideResults) {
      state = JSON.parse(JSON.stringify(this.state));

      state.issues = state.issues.map(issue => {
        if (issue.id === state.activeIssue) {
          for (const playerId in issue.votes) {
            issue.votes[playerId] = {
              ...issue.votes[playerId],
              estimation: null
            }
          }
        }

        return issue;
      })
    }

    saveRoomState(this.roomId, this.state);

    this.node.send({
      type: '__state',
      state
    })
  }

  public beforeDestroy(): void {
    clearInterval(this.syncIntervalId);
    this.node.stop();
  }

  private findActiveIssue(): IIssue | undefined {
    return this.state.issues.find(x => x.id === this.state.activeIssue);

  }

  private enableIntervalSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = setInterval(() => {
      this.sendStateToNetwork();
    }, 10000);
  }

  private onPlayerOnline(message: IPlayerOnlineMessage): void {
    const players = this.state.players;

    if (players.some((player) => player.id === message.player.id)) {
      return;
    }

    this.state.players.push(message.player);
    this.sendStateToNetwork();
  }

  private onPlayerVoted(message: IPlayerVoteMessage): void {
    const activeIssue = this.findActiveIssue();

    if (!activeIssue || message.issue !== activeIssue.id) {
      return;
    }

    const votes = activeIssue.votes;

    if (message.vote.estimation === null) {
      delete votes[message.playerId];
    } else {
      votes[message.playerId] = message.vote;
    }

    this.sendStateToNetwork();
  }

}
