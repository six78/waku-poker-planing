import { Card, Divider, Space, Typography } from "antd";
import { useState, useEffect, useMemo } from "react";
import { usePlayer } from "./player.context";
import { getFibonacciValues } from "../voting/strategy/fibonacci-strategy";
import { VoteOption } from "../voting/vote-option.component";
import { Estimation, IVote } from "../voting/voting.model";
import { PlayersList } from "./players-list.component";
import { IIssue } from "../issue/issue.model";

export function PlayerControlPanel(props: { issue: IIssue }) {
  const { issue } = props;
  const player = usePlayer()!;

  const activeVoteOnNetwork = useMemo(
    () => issue.votes[player.playerId] || null,
    [issue, player]
  );

  const [activeVoteOnDevice, setActiveVoteOnDevice] = useState<Omit<
    IVote,
    "voteBy"
  > | null>(null);

  const [pendingEstimation, setPendingEstimation] = useState<Estimation | null>(
    null
  );

  useEffect(() => {
    const isEstimationWasCleaned =
      activeVoteOnDevice?.estimation === null && activeVoteOnNetwork === null;
    const isEstimationWasApplied =
      activeVoteOnDevice?.timestamp === activeVoteOnNetwork?.timestamp;

    if (isEstimationWasCleaned || isEstimationWasApplied) {
      setPendingEstimation(null);
    }
  }, [activeVoteOnDevice, activeVoteOnNetwork]);

  function handleClick(value: Estimation): void {
    if (pendingEstimation) {
      // There are many problems with event races
      return;
    }

    const isRevoking = value === activeVoteOnDevice?.estimation;
    const result = player.vote(issue.id, isRevoking ? null : value);
    setActiveVoteOnDevice(result);
    setPendingEstimation(value);
  }

  return (
    <Card>
      {issue && (
        <Space direction="vertical" className="w-full">
          <Typography.Text>Players votes:</Typography.Text>
          <PlayersList />
          <Divider></Divider>
          <Typography.Text>Vote here:</Typography.Text>
          <div className="grid grid-cols-12">
            {getFibonacciValues().map((x) => (
              <VoteOption
                onClick={handleClick.bind(undefined, x)}
                key={x}
                showLoader={x === pendingEstimation}
                active={
                  x === activeVoteOnDevice?.estimation && !pendingEstimation
                }
              >
                {x}
              </VoteOption>
            ))}
          </div>
        </Space>
      )}
    </Card>
  );
}
