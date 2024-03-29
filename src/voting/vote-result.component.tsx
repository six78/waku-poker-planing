import { Button, Modal, Space } from "antd";
import { IPlayer, PlayerId, PlayerName } from "../player/player.model";
import { PlayerTag } from "../player/players-list.component";
import { VoteOption } from "./vote-option.component";
import { Estimation, IVote } from "./voting.model";
import { useState } from "react";
import { useDealer } from "../dealer/dealer.context";
import { useActiveIssue, usePlayersList } from "../app/app.state";

interface IEstimation {
  label: string;
  votedBy: PlayerName[];
  value: Estimation | null;
}

function calculateResults(
  players: IPlayer[],
  votes: Record<PlayerId, IVote>
): IEstimation[] {
  const map: { [key: string]: IEstimation } = {};

  players.map((player) => {
    const esimation = votes[player.id];
    const estimationLabel = esimation?.estimation || "No votes";

    if (!map[estimationLabel]) {
      map[estimationLabel] = {
        label: estimationLabel,
        votedBy: [],
        value: esimation.estimation,
      };
    }

    map[estimationLabel].votedBy.push(player.name);
  });

  // TODO: think about sorting
  return Object.values(map);
}

export function VoteResult() {
  const dealer = useDealer();
  const players = usePlayersList();
  const issue = useActiveIssue();

  const [result, setResult] = useState<Estimation | null>(null);

  if (!issue) {
    // TODO:
    throw new Error("");
  }

  function handleEstimationClick(estimation: IEstimation): void {
    if (!dealer || !estimation.value) {
      return;
    }

    setResult(result !== estimation.value ? estimation.value : null);
  }

  const estimations = calculateResults(players, issue.votes);

  return (
    <Modal
      title="Vote results"
      open={true}
      closable={false}
      footer={
        <Space>
          {dealer && <Button onClick={() => dealer.revote()}>Revote</Button>}
          <Button
            type="primary"
            disabled={!result}
            onClick={() => dealer?.submitResult(result!)}
          >
            Submit
          </Button>
        </Space>
      }
    >
      {estimations.map((esimation) => {
        return (
          <div key={esimation.label} className="flex items-center mb-4">
            <VoteOption
              className="flex-shrink-0"
              active={
                esimation.value !== undefined && esimation.value === result
              }
              key={esimation.label}
              onClick={handleEstimationClick.bind(undefined, esimation)}
              showLoader={false}
            >
              {esimation.label}
            </VoteOption>
            <div className="ml-4">
              <Space wrap={true}>
                {esimation.votedBy.map((playerName) => (
                  <PlayerTag key={playerName} color="blue">
                    {playerName}
                  </PlayerTag>
                ))}
              </Space>
            </div>
          </div>
        );
      })}
    </Modal>
  );
}
