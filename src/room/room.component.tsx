import { Header } from "../page-layout/header.component";
import { Deck } from "../deck/deck.component";
import { usePlayer } from "../player/player.context";
import { useEffect, useRef, useState } from "react";
import { DealerControlPanel } from "../dealer/dealer-control-panel.component";
import { VoteResult } from "../voting/vote-result.component";
import { useDealer } from "../dealer/dealer.context";
import { useIssues, useOnlinePlayersList, useVoting } from "../app/app.state";
import { IIssue } from "../issue/issue.model";
import { VoteValue } from "../voting/voting.model";
import { IPlayer } from "../player/player.model";

export function Room() {
  const player = usePlayer()!;
  const dealer = useDealer();
  const [revealVotes, setRevealVotes] = useState(false);
  const [players, setPlayers] = useOnlinePlayersList();

  const playersRef = useRef<IPlayer[]>(players);
  playersRef.current = players;

  const [voting, setVoting] = useVoting();
  const [issues, setIssues] = useIssues();

  useEffect(() => {
    dealer?.init(voting).enableIntervalSync(10000);

    player
      .onStateChanged(setVoting)
      .enableHeartBeat()
      .onPlayerOnline((player) => {
        if (
          playersRef.current!.some(
            (participant) => participant.id === player.id
          )
        ) {
          return;
        }

        setPlayers([...playersRef.current!, player]);
      });
  }, []);

  function revote() {
    setRevealVotes(false);
    dealer?.revote();
  }

  function reveal(issue: IIssue): void {
    if (issue.id !== voting.issue?.id) {
      return;
    }

    setRevealVotes(true);
  }

  function submit(result: VoteValue): void {
    setRevealVotes(false);
    dealer?.endVoting();
    setIssues(
      issues.map((x) => {
        if (x.id === voting.issue?.id) {
          return {
            ...x,
            result: `${result}`,
          };
        }

        return x;
      })
    );
  }

  return (
    <>
      <div className="w-screen h-screen flex">
        <div className="flex flex-col overflow-hidden flex-grow">
          <div className="h-14 drop-shadow-md flex-shrink-0">
            <Header></Header>
          </div>
          <div className="flex-grow overflow-auto">
            <Deck></Deck>
          </div>
        </div>
        {dealer && (
          <div className="w-96 border-l border-gray-300">
            <DealerControlPanel revealVotes={reveal} />
          </div>
        )}
      </div>

      {revealVotes && <VoteResult revote={revote} submit={submit}></VoteResult>}
    </>
  );
}
