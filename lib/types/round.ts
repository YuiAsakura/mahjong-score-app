// lib/types/round.ts
export type RoundResultType = "agari" | "ryukyoku" | "chonbo";

export interface Round {
  id: string;
  roundName: string;
  honba: number;
  parent: string; // 親の player name
  resultType: RoundResultType;

  // 和了
  winner?: string;
  loser?: string;
  tsumoOrRon?: "tsumo" | "ron";
  han?: number;
  fu?: number;
  roleText?: string;

  // 流局
  tenpaiPlayers?: string[];

  // チョンボ
  offender?: string;

  memo: string;

  scoreDelta: Record<string, number>;
}