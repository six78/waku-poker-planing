import { Space, Tag } from "antd";
import { usePlayer } from "./player.context";
import { ReactNode } from "react";
import { useActiveIssue, useAppState } from "../app/app.state";

export function PlayerTag(props: {
  children: ReactNode;
  color: "green" | "blue";
  isCurrentPlayer?: boolean;
}) {
  return (
    <Tag color={props.color}>
      {props.children} {props.isCurrentPlayer ? "(you)" : ""}
    </Tag>
  );
}

export function PlayersList() {
  // TODO: to pure component
  const currentPlayer = usePlayer();
  const { players } = useAppState();
  const activeIssue = useActiveIssue();

  return (
    <Space>
      {players.map((player) => {
        const playerEstimation = activeIssue?.votes[player.id];

        return (
          <PlayerTag
            key={player.id}
            color={playerEstimation ? "green" : "blue"}
            isCurrentPlayer={player.id === currentPlayer?.playerId}
          >
            {player.name}
          </PlayerTag>
        );
      })}
    </Space>
  );
}
