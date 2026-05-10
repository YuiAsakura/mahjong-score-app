// lib/round/roundName.ts

const winds = ["東", "南", "西", "北"];

/**
 * 局名を文字列で返す（例：東1局、南3局）
 * @param roundIndex 0から始まる通算局インデックス
 * @param isThreePlayer 三麻かどうか
 */
export const getRoundDisplayName = (roundIndex: number, isThreePlayer: boolean) => {
  const pCount = isThreePlayer ? 3 : 4; // 三麻なら3局で1周、四麻なら4局で1周
  const windIndex = Math.floor(roundIndex / pCount);
  
  // 4つ以上の風（西入以降）にも対応
  const wind = winds[windIndex] || `西${windIndex - 1}`; 
  const number = (roundIndex % pCount) + 1;
  
  return `${wind}${number}局`;
};

/**
 * 西入りするかどうかの判定
 * @param isThreePlayer 三麻かどうか
 * @param nextRoundIndex 次に進もうとしている局のインデックス
 * @param scores 現在の全員のスコア
 */
export const shouldEnterWest = (
  isThreePlayer: boolean,
  nextRoundIndex: number,
  scores: number[]
): boolean => {
  if (!isThreePlayer) return false; // 四麻はSRSに従い延長なし

  // 三麻：南3局終了（nextRoundIndexが6になるタイミング）で判定
  // 全員が40000点未満なら西入（西1局へ）
  if (nextRoundIndex === 6) {
    return scores.every((s) => s < 40000);
  }
  return false;
};