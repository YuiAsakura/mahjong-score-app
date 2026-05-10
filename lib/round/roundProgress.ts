// lib/round/roundProgress.ts
import { getRoundDisplayName } from "./roundName";

export interface RoundState {
  roundIndex: number;
  honba: number;
  parentSeatIndex: number;
}

/**
 * イベントに基づいて次の局の状態を計算する
 */
export const advanceRound = (
  players: string[],
  state: RoundState,
  event: any,
  scores: number[],
  isThreePlayer: boolean
): RoundState => {
  let { roundIndex, honba, parentSeatIndex } = state;
  const parentName = players[parentSeatIndex];

  // チョンボは親番維持・本場据え置き
  if (event.resultType === "chonbo") {
    return { roundIndex, honba, parentSeatIndex };
  }

  // 和了時の進行
  if (event.resultType === "agari") {
    if (event.winner === parentName) {
      // 親の和了：連荘（親維持・本場+1）
      return { roundIndex, honba: honba + 1, parentSeatIndex };
    }
    // 子の和了：親交代・局進行
    return {
      roundIndex: roundIndex + 1,
      honba: 0,
      parentSeatIndex: (parentSeatIndex + 1) % players.length,
    };
  }

  // 流局時の進行
  if (event.resultType === "ryukyoku") {
    const tenpai = event.tenpaiPlayers ?? [];
    if (tenpai.includes(parentName)) {
      // 親テンパイ：連荘
      return { roundIndex, honba: honba + 1, parentSeatIndex };
    }
    // 親ノーテン：親交代・局進行
    return {
      roundIndex: roundIndex + 1,
      honba: 0,
      parentSeatIndex: (parentSeatIndex + 1) % players.length,
    };
  }

  return state;
};

export const getCurrentRoundName = (state: RoundState, isThreePlayer: boolean) =>
  getRoundDisplayName(state.roundIndex, isThreePlayer);