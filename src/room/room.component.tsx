import { Header } from "../page-layout/header.component";
import { Deck } from "../deck/deck.component";
import { VoteResult } from "../voting/vote-result.component";
import { useDealer } from "../dealer/dealer.context";
import { Flex } from "antd";
import { AddIssue } from "../issue/components/add-issue.component";
import { IssueList } from "../issue/components/issue-list.component";
import { useAppState } from "../app/app.state";

export function Room() {
  const dealer = useDealer();
  const appState = useAppState();

  return (
    <>
      <div className="w-screen h-screen flex">
        <div className="flex flex-col overflow-hidden flex-grow">
          <Header></Header>
          <div className="flex-grow overflow-auto">
            <Deck></Deck>
          </div>
        </div>
        <div className="w-96 border-l border-gray-300">
          <Flex
            vertical
            gap="large"
            className="w-full h-full bg-white py-3 px-6"
          >
            {dealer && (
              <AddIssue addIssue={(issue) => dealer?.addIssue(issue)} />
            )}
            <IssueList></IssueList>
          </Flex>
        </div>
      </div>

      {appState.votesRevealed && <VoteResult />}
    </>
  );
}
