// lib/crud/stats.ts
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { Hanchan } from "@/lib/types/hanchan";
import { Round } from "@/lib/types/round";

export interface UserStats {
  name: string;
  totalHanchans: number;
  ranks: { [rank: number]: number };
  totalRounds: number;  // その人が参加した総局数
  winCount: number;     // アガった回数
  tsumoCount: number;   // うちツモった回数
  dealInCount: number;  // 振り込んだ回数
  totalScore: number;
}

export type StatsResult = {
  "4p": UserStats[];
  "3p": UserStats[];
};

// 内部用：ユーザーごとの統計オブジェクトを初期化
const createInitStats = (name: string): UserStats => ({
  name, totalHanchans: 0, ranks: { 1: 0, 2: 0, 3: 0, 4: 0 },
  totalRounds: 0, winCount: 0, tsumoCount: 0, dealInCount: 0, totalScore: 0
});

/**
 * 全セッションを横断して通算戦績を算出
 */
export async function calculateGlobalStats(): Promise<StatsResult> {
  const stats4p: Record<string, UserStats> = {};
  const stats3p: Record<string, UserStats> = {};

  const sessionsSnapshot = await getDocs(collection(db, "sessions"));
  
  for (const sDoc of sessionsSnapshot.docs) {
    const hanchansRef = collection(db, "sessions", sDoc.id, "hanchans");
    const hSnapshot = await getDocs(query(hanchansRef, where("status", "==", "completed")));
    
    for (const hDoc of hSnapshot.docs) {
      const h = { id: hDoc.id, ...hDoc.data() } as Hanchan;
      const is3p = h.type !== "4p-tonnan";
      const targetMap = is3p ? stats3p : stats4p;

      // 順位とスコアの集計
      Object.entries(h.finalScore).forEach(([name, score], index) => {
        if (!targetMap[name]) targetMap[name] = createInitStats(name);
        // 順位判定（スコア順）
        const rank = Object.entries(h.finalScore)
          .sort((a, b) => b[1] - a[1])
          .findIndex(([n]) => n === name) + 1;

        targetMap[name].totalHanchans++;
        targetMap[name].ranks[rank]++;
        targetMap[name].totalScore += score;
      });

      // 局ごとの和了・放銃を集計
      const rSnapshot = await getDocs(collection(db, "sessions", sDoc.id, "hanchans", hDoc.id, "rounds"));
      rSnapshot.forEach(rDoc => {
        const r = rDoc.data() as Round;
        // その半荘にいた全員の参加局数をカウントアップ
        h.players.forEach(p => {
          if (targetMap[p]) targetMap[p].totalRounds++;
        });

        if (r.resultType === "agari" && r.winner && targetMap[r.winner]) {
          targetMap[r.winner].winCount++;
          if (r.tsumoOrRon === "tsumo") targetMap[r.winner].tsumoCount++;
        }
        if (r.resultType === "agari" && r.tsumoOrRon === "ron" && r.loser && targetMap[r.loser]) {
          targetMap[r.loser].dealInCount++;
        }
      });
    }
  }

  return {
    "4p": Object.values(stats4p).filter(s => s.totalHanchans > 0),
    "3p": Object.values(stats3p).filter(s => s.totalHanchans > 0)
  };
}

/**
 * 特定のセッション内の戦績を算出
 */
export async function calculateSessionStats(sessionId: string, players: string[]): Promise<StatsResult> {
  const stats4p: Record<string, UserStats> = {};
  const stats3p: Record<string, UserStats> = {};
  
  players.forEach(p => {
    stats4p[p] = createInitStats(p);
    stats3p[p] = createInitStats(p);
  });

  const hSnapshot = await getDocs(query(collection(db, "sessions", sessionId, "hanchans"), where("status", "==", "completed")));
  
  for (const hDoc of hSnapshot.docs) {
    const h = { id: hDoc.id, ...hDoc.data() } as Hanchan;
    const is3p = h.type !== "4p-tonnan";
    const targetMap = is3p ? stats3p : stats4p;

    Object.entries(h.finalScore).forEach(([name, score]) => {
      if (targetMap[name]) {
        const rank = Object.entries(h.finalScore)
          .sort((a, b) => b[1] - a[1])
          .findIndex(([n]) => n === name) + 1;
        targetMap[name].totalHanchans++;
        targetMap[name].ranks[rank]++;
        targetMap[name].totalScore += score;
      }
    });

    const rSnapshot = await getDocs(collection(db, "sessions", sessionId, "hanchans", hDoc.id, "rounds"));
    rSnapshot.forEach(rDoc => {
      const r = rDoc.data() as Round;
      h.players.forEach(p => { if (targetMap[p]) targetMap[p].totalRounds++; });
      if (r.resultType === "agari" && r.winner && targetMap[r.winner]) {
        targetMap[r.winner].winCount++;
        if (r.tsumoOrRon === "tsumo") targetMap[r.winner].tsumoCount++;
      }
      if (r.resultType === "agari" && r.tsumoOrRon === "ron" && r.loser && targetMap[r.loser]) {
        targetMap[r.loser].dealInCount++;
      }
    });
  }

  return {
    "4p": Object.values(stats4p).filter(s => s.totalHanchans > 0),
    "3p": Object.values(stats3p).filter(s => s.totalHanchans > 0)
  };
}