import { useEffect, useMemo, useState } from "react";
import { DisplayState } from "./components/display-state.component";
import { AppStateContext } from "./context/app-state.context";
import { WakuNodeService } from "./waku/waku-node.service";
import "./App.css";
import { CurrentUserService } from "./user/current-user.service";
import { IGameState } from "./game/game-state.model";
import { PlayerEventsService } from "./player/player-events.service";
import { GameStateSyncService } from "./dealer/game-state-sync.service";
import { DealerEventsService } from "./dealer/dealer-events.service";

const currentUserService = new CurrentUserService();

function App(props: { node: WakuNodeService }) {
  currentUserService.validate();

  const [state, setState] = useState<IGameState>({
    players: [],
    voteFor: null,
  });

  const participantMessageService = useMemo(
    () => new PlayerEventsService(props.node, currentUserService),
    [props.node]
  );

  useEffect(() => {
    if (!currentUserService.host) {
      return;
    }

    const sidr = new DealerEventsService(props.node, currentUserService);
    const moh = new GameStateSyncService(sidr);

    moh.init().enableIntervalSync(10000);
  }, [props.node]);

  useEffect(() => {
    participantMessageService.onStateChanged(setState);
    participantMessageService.playerIsOnline();
  }, [participantMessageService]);

  return (
    <AppStateContext.Provider value={state}>
      <DisplayState></DisplayState>
    </AppStateContext.Provider>
  );
}

export default App;
