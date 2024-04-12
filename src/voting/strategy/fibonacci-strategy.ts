import { Estimation } from '../voting.model';

export function getFibonacciValues(): Estimation[] {
  return [1, 2, 3, 5, 8, 13, 21, 34, 50].map(x => x.toString());
}

// enum EstimationType {
//   None,
//   Suggested,
//   Risk
// }

// interface IEstimation {
//   value?: Estimation;
//   label: string;
//   votedBy: PlayerName[];
//   type: EstimationType;
// }

// interface IEstimationResult {
//   isProper: boolean;
//   estimations: IEstimation[];
// }

// function calculateResults(
//   players: IPlayer[],
//   votes: Record<PlayerId, IVote>
// ): IEstimation[] {
//   const playersWithoutVotes: PlayerName[] = [];
//   const map: Record<Estimation, PlayerId[]> = {};

//   players.forEach((player) => {
//     const vote = votes[player.id];
//     if (!vote || vote.estimation === null) {
//       playersWithoutVotes.push(player.name)
//       return;
//     }

//     if (!map[vote.estimation]) {
//       map[vote.estimation] = [];
//     }

//     map[vote.estimation].push(player.id);
//   });

//   const moh: { value: Estimation, index: number, votes: PlayerId }[] = []

//   getFibonacciValues().forEach((value, index) => {
//     const votes = map[value];
//     if (!votes) {
//       return;
//     }

//     moh.push({
//       value,
//       index,

//     })

//   })


//   // const map: { [key: string]: IEstimation } = {};

//   // 

//   // // TODO: think about sorting
//   // return Object.values(map);
// }