// lib/score/utils.ts

/**
 * 100点単位で切り上げる
 * 例: 1210 -> 1300
 */
export const ceil100 = (points: number): number => {
  return Math.ceil(points / 100) * 100;
};

/**
 * 役の強さを判定して基本点を返す
 */
export const getLimitBasePoints = (han: number, fu: number): number | null => {
  if (han >= 13) return 8000; // 役満
  if (han >= 11) return 6000; // 三倍満
  if (han >= 8) return 4000;  // 倍満
  if (han >= 6) return 3000;  // 跳満
  if (han >= 5) return 2000;  // 満貫
  
  // 満貫未満の判定（4翻30符以上、3翻60符以上など）
  if (han === 4 && fu >= 30) return 2000;
  if (han === 3 && fu >= 60) return 2000;
  
  return null; // 満貫未満
};