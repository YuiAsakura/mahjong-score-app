// components/stats/UserStatCard.tsx
import { RankPieChart } from "./RankPieChart";

interface UserStats {
  userName: string;
  matchCount: number;
  agariRate: number;
  houjuRate: number;
  avgAgariScore: number;
  tsumoRate: number;
  rankDist: { 1: number; 2: number; 3: number; 4: number };
}

export function UserStatCard({ stats }: { stats: UserStats }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
      {/* ユーザー名 */}
      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
        <h3 className="text-lg font-black text-slate-800">{stats.userName}</h3>
      </div>

      {/* 4つの小枠グリッド */}
      <div className="grid grid-cols-2 gap-3">
        {/* 小枠1: 対戦数 */}
        <div className="bg-slate-50 p-3 rounded-2xl text-center flex flex-col justify-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Matches</span>
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-xl font-black text-slate-800">{stats.matchCount}</span>
            <span className="text-[10px] font-bold text-slate-400">戦</span>
          </div>
        </div>

        {/* 小枠2: 和了率・放銃率 */}
        <div className="bg-slate-50 p-3 rounded-2xl text-center flex flex-col justify-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Agari / Houju</span>
          <div className="flex justify-center items-center gap-1">
            <span className="text-xs font-black text-blue-600">{stats.agariRate}%</span>
            <span className="text-[10px] text-slate-300">/</span>
            <span className="text-xs font-black text-red-500">{stats.houjuRate}%</span>
          </div>
        </div>

        {/* 小枠3: 平均和了・ツモ率 */}
        <div className="bg-slate-50 p-3 rounded-2xl text-center flex flex-col justify-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Avg. Score / Tsumo</span>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-black text-slate-700">{Math.round(stats.avgAgariScore).toLocaleString()}点</span>
            <span className="text-[10px] font-bold text-blue-500">{stats.tsumoRate}%</span>
          </div>
        </div>

        {/* 小枠4: 順位割合 */}
        <div className="bg-slate-50 p-2 rounded-2xl flex flex-col items-center justify-center">
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Ranks</span>
          <div className="w-10 h-10">
            <RankPieChart data={stats.rankDist} />
          </div>
        </div>
      </div>
    </div>
  );
}