import { IMessage, IStateMessage } from '../game/game-message.model';
import { IGameState } from '../game/game-state.model';
import { WakuNodeService } from '../waku/waku-node.service';

// TODO: этот сервис нах не нужен
export class DealerEventsService {
  constructor(
    protected readonly node: WakuNodeService
  ) { }
  public sendState(state: IGameState): void {
    const message: IStateMessage = {
      type: '__state',
      state
    };

    this.node.send(message);
  }

  public onMessageReceived(callback: (message: IMessage) => void) {
    this.node.subscribe(callback);
  }
}