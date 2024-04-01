import { useEffect, useMemo, useRef, useState } from "react";
import { Spin } from "antd";

import { useParams } from "react-router-dom";
import { getUserDataFromLocalStorage } from "./user/current-user";
import { WakuNodeService } from "./waku/waku-node.service";
import { PlayerService } from "./player/player.service";
import { PlayerContext } from "./player/player.context";
import { DealerServiceContext } from "./dealer/dealer.context";
import { DealerService } from "./dealer/dealer.service";
import { Room } from "./room/room.component";
import { isCurrentUserDealerForRoom } from "./dealer/dealer-resolver";
import { useUpdateAppState } from "./app/app.state";
import { RoomConfig } from "./room/room";

export function App() {
  const { id: roomId } = useParams();
  const user = useMemo(getUserDataFromLocalStorage, []);
  const playerServiceRef = useRef<PlayerService | null>(null);
  const dealerServiceRef = useRef<DealerService | null>(null);

  if (!roomId || !user) {
    throw new Error(
      `Cannot initialize app for room ${roomId} and user ${JSON.stringify(
        user
      )}`
    );
  }

  useEffect(() => {
    return () => {
      playerServiceRef.current?.beforeDestroy();
      dealerServiceRef.current?.beforeDestroy();
      updateAppState(null);
    };
  }, []);

  const isDealer = isCurrentUserDealerForRoom(roomId);
  const [appState, updateAppState] = useUpdateAppState();

  const [playerService, setPlayerService] = useState<PlayerService | null>(
    null
  );
  const [dealerService, setDealerService] = useState<DealerService | null>(
    null
  );

  useEffect(() => {
    const roomConfig = RoomConfig.create(roomId);
    WakuNodeService.create(roomConfig.contentTopic).then((node) => {
      if (!node) {
        return;
      }

      dealerServiceRef.current = isDealer
        ? new DealerService(node, roomId)
        : null;
      playerServiceRef.current = new PlayerService(node, user);

      playerServiceRef.current.onStateChanged(updateAppState);

      setDealerService(dealerServiceRef.current);
      setPlayerService(playerServiceRef.current);
    });
  }, [roomId, user, isDealer, updateAppState]);

  return appState ? (
    <PlayerContext.Provider value={playerService}>
      <DealerServiceContext.Provider value={dealerService}>
        <Room />
      </DealerServiceContext.Provider>
    </PlayerContext.Provider>
  ) : (
    <div className="h-screen w-screen flex justify-center items-center">
      <Spin size="large" />
    </div>
  );
}
