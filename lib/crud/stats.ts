// lib/crud/stats.ts
import { collection, getDocs, query, where, collectionGroup } from "firebase/firestore";
import { db } from "@/firebase";
import { Hanchan } from "@/lib/types/hanchan";

// 今後、この型を基本とします
export interface UserStats {
  name: string;             // プレイヤー名
  totalHanchans: number;    // 対戦数
  ranks: { [rank: number]: number }; // 1~4位の回数
  // 詳細分析用
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

const createInitStats = (name: string): UserStats => ({
  name,
  totalHanchans: 0,
  ranks: { 1: 0, 2: 0, 3: 0, 4: 0 },
  totalRounds: 0,
  winCount: 0,
  tsumoCount: 0,
  dealInCount: 0,
  totalAgariScore: 0
});

// 計算の共通処理
async function processStats(hanchans: Hanchan[]): Promise<StatsResult> {
  const stats4p: Record<string, UserStats> = {};
  const stats3p: Record<string, UserStats> = {};

  for (const h of hanchans) {
    const is3p = h.type !== "4p-tonnan";
    const targetMap = is3p ? stats3p : stats4p;

    const sortedScores = Object.entries(h.finalScore).sort((a, b) => b[1] - a[1]);
    
    Object.entries(h.finalScore).forEach(([name]) => {
      if (!targetMap[name]) targetMap[name] = createInitStats(name);
      const rank = sortedScores.findIndex(([n]) => n === name) + 1;
      targetMap[name].totalHanchans++;
      targetMap[name].ranks[rank]++;
    });
  }

  const finalize = (map: Record<string, UserStats>) => 
    Object.values(map).sort((a, b) => b.totalHanchans - a.totalHanchans);

  return {
    "4p": finalize(stats4p),
    "3p": finalize(stats3p)
  };
}

// 全体戦績（collectionGroupを使用して高速化）
export async function calculateGlobalStats(): Promise<StatsResult> {
  const q = query(collectionGroup(db, "hanchans"), where("status", "==", "completed"));
  const snapshot = await getDocs(q);
  const hanchans = snapshot.docs.map(d => d.data() as Hanchan);
  return processStats(hanchans);
}

// セッション別戦績
export async function calculateSessionStats(sessionId: string): Promise<StatsResult> {
  const q = query(collection(db, "sessions", sessionId, "hanchans"), where("status", "==", "completed"));
  const snapshot = await getDocs(q);
  const hanchans = snapshot.docs.map(d => d.data() as Hanchan);
  return processStats(hanchans);
}