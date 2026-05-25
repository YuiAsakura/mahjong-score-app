// lib/crud/stats.ts
import { collection, getDocs, query, where, collectionGroup, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/firebase";
import { Hanchan } from "@/lib/types/hanchan";
import { Round } from "@/lib/types/round";

// 既存の型定義を維持（既存データとの互換性を確保）
export interface UserStats {
  name: string;
  totalHanchans: number;
  ranks: { [rank: number]: number };
  totalRounds: number;  // その人が参加した総局数
  winCount: number;     // アガった回数
  tsumoCount: number;   // うちツモった回数
  dealInCount: number;  // 振り込んだ回数
  totalScore: number;
  totalAgariScore: number; // 平均和了算出用（新規追加）
}

export type StatsResult = {
  "4p": UserStats[];
  "3p": UserStats[];
};

// 内部用：ユーザーごとの統計オブジェクトを初期化
const createInitStats = (name: string): UserStats => ({
  name, 
  totalHanchans: 0, 
  ranks: { 1: 0, 2: 0, 3: 0, 4: 0 },
  totalRounds: 0, 
  winCount: 0, 
  tsumoCount: 0, 
  dealInCount: 0, 
  totalScore: 0,
  totalAgariScore: 0
});

/**
 * 取得した半荘データと局データから統計を算出する共通ロジック
 */
async function aggregateStats(
  hanchans: (Hanchan & { ref: any })[]
): Promise<StatsResult> {
  const stats4p: Record<string, UserStats> = {};
  const stats3p: Record<string, UserStats> = {};

  // 全ての半荘の rounds 取得リクエストを「同時並列」で投げる（ここが爆速化のポイント）
  const roundsPromises = hanchans.map(h => getDocs(collection(h.ref, "rounds")));
  const allRoundsSnapshots = await Promise.all(roundsPromises);

  hanchans.forEach((h, index) => {
    const is3p = h.type !== "4p-tonnan";
    const targetMap = is3p ? stats3p : stats4p;

    // 順位集計
    const sortedScores = Object.entries(h.finalScore).sort((a, b) => b[1] - a[1]);
    Object.entries(h.finalScore).forEach(([name, score]) => {
      if (!targetMap[name]) targetMap[name] = createInitStats(name);
      
      const rank = sortedScores.findIndex(([n]) => n === name) + 1;
      targetMap[name].totalHanchans++;
      targetMap[name].ranks[rank]++;
      targetMap[name].totalScore += score;
    });

    // その半荘に対応する rounds データの集計
    const rSnapshot = allRoundsSnapshots[index];
    rSnapshot.forEach(rDoc => {
      const r = rDoc.data() as Round;
      
      // 参加局数
      h.players.forEach(p => {
        if (targetMap[p]) targetMap[p].totalRounds++;
      });

      // 和了・ツモ・打点
      if (r.resultType === "agari" && r.winner && targetMap[r.winner]) {
        targetMap[r.winner].winCount++;
        // 打点を加算（フィールド名が agariScore の前提）
        const score = (r as any).agariScore || 0; 
        targetMap[r.winner].totalAgariScore += score;

        if (r.tsumoOrRon === "tsumo") {
          targetMap[r.winner].tsumoCount++;
        }
      }

      // 放銃
      if (r.resultType === "agari" && r.tsumoOrRon === "ron" && r.loser && targetMap[r.loser]) {
        targetMap[r.loser].dealInCount++;
      }
    });
  });

  const finalize = (map: Record<string, UserStats>) => 
    Object.values(map).sort((a, b) => b.totalHanchans - a.totalHanchans);

  return {
    "4p": finalize(stats4p),
    "3p": finalize(stats3p)
  };
}

/**
 * 全セッションを横断して通算戦績を算出（collectionGroupを使用）
 */
export async function calculateGlobalStats(): Promise<StatsResult> {
  const q = query(collectionGroup(db, "hanchans"));
  const snapshot = await getDocs(q);

  // --- デバッグ用 ---
  console.log("Firestoreから取得した対局数:", snapshot.docs.length);
  if (snapshot.docs.length > 0) {
    console.log("1件目のデータ:", snapshot.docs[0].data());
  }
  // -----------------
  
  const hanchans = snapshot.docs.map(d => ({
    id: d.id,
    ref: d.ref, // rounds取得に必要
    ...d.data()
  } as Hanchan & { ref: any }));

  return aggregateStats(hanchans);
}

/**
 * 特定のセッション内の戦績を算出
 */
export async function calculateSessionStats(sessionId: string): Promise<StatsResult> {
  const hanchansRef = collection(db, "sessions", sessionId, "hanchans");
  const snapshot = await getDocs(query(hanchansRef, where("status", "==", "completed")));
  
  const hanchans = snapshot.docs.map(d => ({
    id: d.id,
    ref: d.ref,
    ...d.data()
  } as Hanchan & { ref: any }));

  return aggregateStats(hanchans);
}