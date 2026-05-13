// lib/types/hanchan.ts

export type HanchanType = "4p-tonnan" | "3p-tonnan" | "3p-ton";

export interface Hanchan {
  id?: string;
  type: HanchanType;
  players: string[];       // プレイヤー名の配列
  seats: {                 // 座席情報 (east, south, west, north)
    east: string;
    south: string;
    west: string;
    north?: string | null;
  };
  startScore: number;      // 開始点数
  finalScore: Record<string, number>; // 現在の点数
  status: "active" | "completed";     // 進行中か終了か
  
  // 局の状態を保存するフィールド（再開用）
  lastRoundIndex?: number;
  lastHonba?: number;
  lastParentSeatIndex?: number;
  
  createdAt: any;
}