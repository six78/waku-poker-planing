import { Card } from "antd";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "./player.context";
import { useGame } from "../app/app-state.context";
import { getFibonacciValues } from "../voting/strategy/fibonacci-strategy";
import { VoteOption } from "../voting/vote-option.component";
import { VoteValue } from "../voting/voting.model";
import useMessage from "antd/es/message/useMessage";
import { appConfig } from "../app/app.config";

const TIMEOUT = 10000;

export function PlayerControlPanel() {
  const [messageApi, contextHolder] = useMessage();
  const player = usePlayer()!;

  const { voteItem: issue, tempVoteResults } = useGame();

  // Player vote stored in the game state
  const appliedVote = (tempVoteResults || {})[player.playerId];
  // Player vote on player's device that didn't reach the game state
  const [pendingVote, setPendingVote] = useState<VoteValue | null>(null);
  const [revokedVote, setRevokedVote] = useState<VoteValue | null>(null);

  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      console.warn("RESETING TIMER");
      clearTimeoutIfExists();
    };
  }, []);

  useEffect(() => {
    console.log("VOTE APPLIED", appliedVote);
    console.log("PENDING VOTE:", pendingVote);
    console.log("REVOKED VOTE:", revokedVote);

    if (revokedVote) {
      if (!appliedVote) {
        setPendingVote(null);
        setRevokedVote(null);
      }

      return;
    }

    if (appliedVote === pendingVote) {
      setPendingVote(null);
    }
  }, [appliedVote, pendingVote, revokedVote]);

  function submitVote(value: VoteValue): void {
    setRevokedVote(null);
    setPendingVote(value);
    sendVote(value);
  }

  function revokeVote(value: VoteValue): void {
    setRevokedVote(value);
    setPendingVote(value);
    sendVote(null);
  }

  function sendVote(value: VoteValue | null): void {
    player.vote(issue!.id, value);
    clearTimeoutIfExists();
    timeoutId.current = setTimeout(() => {
      messageApi.error(
        `Vote was not applied for ${TIMEOUT} ms, Please revote`,
        appConfig.messageTimeout
      );
      setRevokedVote(null);
      setPendingVote(null);
    }, TIMEOUT);
  }

  function handleClick(value: VoteValue): void {
    if (pendingVote) {
      // There are many problems with event races
      return;
    }

    const isRevoking = value === appliedVote;
    isRevoking ? revokeVote(value) : submitVote(value);
  }

  function clearTimeoutIfExists(): void {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
  }

  return (
    <Card>
      {contextHolder}
      {issue && (
        <div>
          <div className="grid grid-cols-12">
            {getFibonacciValues().map((x) => (
              <VoteOption
                onClick={handleClick.bind(undefined, x)}
                key={x}
                showLoader={x === pendingVote}
                active={x === appliedVote}
              >
                {x}
              </VoteOption>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
