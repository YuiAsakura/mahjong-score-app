// lib/crud/stats.ts
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import { Hanchan } from "@/lib/types/hanchan";
import { Round } from "@/lib/types/round";

export interface UserStats {
  name: string;
  // 枠1: 概要
  totalHanchans: number; // 対戦数 (ソート用)
  
  // 枠2: 攻撃・守備
  agariRate: number;     // 和了率 (%)
  houjuRate: number;     // 放銃率 (%)
  
  // 枠3: 質
  avgAgariScore: number; // 平均和了 (点数)
  tsumoRate: number;     // ツモ率 (%)
  
  // 枠4: 順位割合 (1~4位の回数)
  ranks: { [rank: number]: number };

  // 内部計算用 (UIには表示しない)
  totalRounds: number;
  winCount: number;
  tsumoCount: number;
  dealInCount: number;
  totalAgariScore: number; 
}

export type StatsResult = {
  "4p": UserStats[];
  "3p": UserStats[];
};

// 内部用：ユーザーごとの統計オブジェクトを初期化
const createInitStats = (name: string): UserStats => ({
  name,
  totalHanchans: 0,
  agariRate: 0,
  houjuRate: 0,
  avgAgariScore: 0,
  tsumoRate: 0,
  ranks: { 1: 0, 2: 0, 3: 0, 4: 0 },
  totalRounds: 0,
  winCount: 0,
  tsumoCount: 0,
  dealInCount: 0,
  totalAgariScore: 0
});

/**
 * 統計データの最終計算とソートを行う内部関数
 */
const finalizeStats = (statsMap: Record<string, UserStats>): UserStats[] => {
  return Object.values(statsMap)
    .filter(s => s.totalHanchans > 0)
    .map(s => {
      const totalRounds = s.totalRounds || 1;
      const winCount = s.winCount || 1;

      return {
        ...s,
        agariRate: parseFloat(((s.winCount / totalRounds) * 100).toFixed(1)),
        houjuRate: parseFloat(((s.dealInCount / totalRounds) * 100).toFixed(1)),
        avgAgariScore: Math.round(s.totalAgariScore / (s.winCount || 1)),
        tsumoRate: parseFloat(((s.tsumoCount / (s.winCount || 1)) * 100).toFixed(1)),
      };
    })
    // 対戦数が多い順にソート
    .sort((a, b) => b.totalHanchans - a.totalHanchans);
};

/**
 * 全セッションを横断して通算戦績を算出（トップページ用）
 */
export async function calculateGlobalStats(): Promise<StatsResult> {
  const stats4p: Record<string, UserStats> = {};
  const stats3p: Record<string, UserStats> = {};

  // 全セッションを取得
  const sessionsSnapshot = await getDocs(collection(db, "sessions"));
  
  for (const sDoc of sessionsSnapshot.docs) {
    // 各セッション内の完了済み半荘を取得
    const hanchansRef = collection(db, "sessions", sDoc.id, "hanchans");
    const hSnapshot = await getDocs(query(hanchansRef, where("status", "==", "completed")));
    
    for (const hDoc of hSnapshot.docs) {
      await processHanchan(hDoc, sDoc.id, stats4p, stats3p);
    }
  }

  return {
    "4p": finalizeStats(stats4p),
    "3p": finalizeStats(stats3p)
  };
}

/**
 * 特定のセッション内の戦績を算出（セッション詳細用）
 */
export async function calculateSessionStats(sessionId: string): Promise<StatsResult> {
  const stats4p: Record<string, UserStats> = {};
  const stats3p: Record<string, UserStats> = {};
  
  const hanchansRef = collection(db, "sessions", sessionId, "hanchans");
  const hSnapshot = await getDocs(query(hanchansRef, where("status", "==", "completed")));
  
  for (const hDoc of hSnapshot.docs) {
    await processHanchan(hDoc, sessionId, stats4p, stats3p);
  }

  return {
    "4p": finalizeStats(stats4p),
    "3p": finalizeStats(stats3p)
  };
}

/**
 * 半荘1件ごとの集計ロジック（共通化）
 */
async function processHanchan(
  hDoc: any, 
  sessionId: string, 
  stats4p: Record<string, UserStats>, 
  stats3p: Record<string, UserStats>
) {
  const h = { id: hDoc.id, ...hDoc.data() } as Hanchan;
  const is3p = h.type !== "4p-tonnan";
  const targetMap = is3p ? stats3p : stats4p;

  // 順位の集計
  const sortedScores = Object.entries(h.finalScore).sort((a, b) => b[1] - a[1]);
  
  Object.entries(h.finalScore).forEach(([name, score]) => {
    if (!targetMap[name]) targetMap[name] = createInitStats(name);
    
    const rank = sortedScores.findIndex(([n]) => n === name) + 1;
    targetMap[name].totalHanchans++;
    targetMap[name].ranks[rank]++;
  });

  // 局ごとの詳細集計（和了・放銃・打点）
  const rSnapshot = await getDocs(collection(db, "sessions", sessionId, "hanchans", hDoc.id, "rounds"));
  
  rSnapshot.forEach(rDoc => {
    const r = rDoc.data() as Round;
    
    // 参加局数
    h.players.forEach(p => {
      if (targetMap[p]) targetMap[p].totalRounds++;
    });

    if (r.resultType === "agari" && r.winner && targetMap[r.winner]) {
      targetMap[r.winner].winCount++;
      // 打点を加算（Round型に agariScore またはそれに準ずるフィールドがある前提）
      // もしフィールド名が違う場合は修正してください
      const score = (r as any).agariScore || 0; 
      targetMap[r.winner].totalAgariScore += score;

      if (r.tsumoOrRon === "tsumo") {
        targetMap[r.winner].tsumoCount++;
      }
    }

    if (r.resultType === "agari" && r.tsumoOrRon === "ron" && r.loser && targetMap[r.loser]) {
      targetMap[r.loser].dealInCount++;
    }
  });
}