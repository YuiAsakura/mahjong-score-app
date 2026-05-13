export interface UserStats {
  userName: string;
  matchCount: number;      // 対戦数 (ソート順のキー)
  
  // 枠2: 攻撃・守備
  agariRate: number;       // 和了率
  houjuRate: number;       // 放銃率
  
  // 枠3: 質
  avgAgariScore: number;   // 平均和了（新規）
  tsumoRate: number;       // ツモ率
  
  // 枠4: 順位割合
  rankDist: {              // 1~4位の割合
    1: number;
    2: number;
    3: number;
    4: number;
  };
}