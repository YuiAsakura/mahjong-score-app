// lib/score/calculator.ts
import { ceil100, getLimitBasePoints } from "./utils";

export interface ScoreResult {
  total: number;
  payout: { [seat: string]: number }; // 各プレイヤーの変動点数
}

export const calculateScore = (params: {
  han: number;
  fu: number;
  isParent: boolean;
  isTsumo: boolean;
  isThreePlayer: boolean;
  parentSeat: string;
  winnerSeat: string;
  loserSeat?: string; // ロンの場合のみ
  allPlayers: string[];
  honba: number;
}): ScoreResult => {
  const { han, fu, isParent, isTsumo, isThreePlayer, parentSeat, winnerSeat, loserSeat, allPlayers, honba } = params;

  // 1. 基本点の算出
  let basePoints = getLimitBasePoints(han, fu);
  if (basePoints === null) {
    // 満貫未満: 基本点 = 符 * 2^(翻+2)
    basePoints = fu * Math.pow(2, han + 2);
    if (basePoints > 2000) basePoints = 2000; // 切り上げ満貫考慮
  }

  const scoreDelta: Record<string, number> = {};
  allPlayers.forEach((p) => (scoreDelta[p] = 0));

  const honbaPoints = isThreePlayer ? 200 : 300; // 本場加算分（三麻は200、四麻は300）

  // 2. 授受計算
  if (isTsumo) {
    // 【ツモ和了】
    if (isParent) {
      // 親のツモ：全員が基本点*2を支払い
      const payment = ceil100(basePoints * 2) + honba * (honbaPoints / (isThreePlayer ? 2 : 3));
      let total = 0;
      allPlayers.forEach((p) => {
        if (p !== winnerSeat) {
          scoreDelta[p] = -payment;
          total += payment;
        }
      });
      scoreDelta[winnerSeat] = total;
    } else {
      // 子のツモ：親が基本点*2、子が基本点*1を支払い
      const parentPayment = ceil100(basePoints * 2) + honba * (honbaPoints / (isThreePlayer ? 2 : 3));
      const childPayment = ceil100(basePoints) + honba * (honbaPoints / (isThreePlayer ? 2 : 3));
      let total = 0;
      allPlayers.forEach((p) => {
        if (p === winnerSeat) return;
        const pay = (p === parentSeat) ? parentPayment : childPayment;
        scoreDelta[p] = -pay;
        total += pay;
      });
      scoreDelta[winnerSeat] = total;
    }
  } else if (loserSeat) {
    // 【ロン和了】
    const multiplier = isParent ? 6 : 4;
    const payment = ceil100(basePoints * multiplier) + honba * honbaPoints;
    scoreDelta[loserSeat] = -payment;
    scoreDelta[winnerSeat] = payment;
  }

  return {
    total: scoreDelta[winnerSeat],
    payout: scoreDelta,
  };
};

/**
 * チョンボの支払い計算
 */
export const calculateChonbo = (
  offender: string,
  isParent: boolean,
  isThreePlayer: boolean,
  allPlayers: string[]
): Record<string, number> => {
  const scoreDelta: Record<string, number> = {};
  const penalty = isParent ? 4000 : 2000; // 親4000、子2000 (SRS仕様)

  allPlayers.forEach((p) => {
    if (p === offender) {
      scoreDelta[p] = -penalty * (isThreePlayer ? 2 : 3);
    } else {
      scoreDelta[p] = penalty;
    }
  });
  return scoreDelta;
};