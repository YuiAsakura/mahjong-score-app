// components/stats/UserCard.tsx
import { RankBarChart } from "./RankBarChart";

interface UserStats {
  userName: string;
  totalHanchans: number;
  agariRate: number;
  houjuRate: number;
  avgAgariScore: number;
  tsumoRate: number;
  rankDist: { 1: number; 2: number; 3: number; 4: number };
}

export function UserCard({ stats }: { stats: UserStats }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
      {/* ヘッダー: ユーザー名と対戦数(右上) */}
      <div className="flex justify-between items-start border-b border-slate-50 pb-2">
        <h3 className="text-lg font-black text-slate-800">{stats.userName}</h3>
        <div className="bg-slate-100 px-2.5 py-1 rounded-xl">
          <span className="text-[10px] font-black text-slate-500">{stats.totalHanchans}</span>
          <span className="text-[8px] font-bold text-slate-400 ml-0.5">戦</span>
        </div>
      </div>

      {/* 4つの小枠グリッド */}
      <div className="grid grid-cols-2 gap-3">
        {/* 小枠1: 和了率・放銃率 */}
        <div className="bg-slate-50 p-3 rounded-2xl flex flex-col justify-center">
          <span className="text-[9px] font-black text-slate-400 mb-1">和了率 / 放銃率</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-black text-blue-600">{stats.agariRate}%</span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-sm font-black text-red-500">{stats.houjuRate}%</span>
          </div>
        </div>

        {/* 小枠2: 平均和了・ツモ率 */}
        <div className="bg-slate-50 p-3 rounded-2xl flex flex-col justify-center">
          <span className="text-[9px] font-black text-slate-400 mb-1">平均和了 / ツモ率</span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-black text-slate-700">{Math.round(stats.avgAgariScore).toLocaleString()}点</span>
            <span className="text-[10px] font-bold text-blue-500">{stats.tsumoRate}%</span>
          </div>
        </div>

        {/* 下段: 順位割合（長方形の割合グラフを横幅いっぱいに使用） */}
        <div className="bg-slate-50 p-3 rounded-2xl col-span-2">
           <span className="text-[9px] font-black text-slate-400 mb-2 block uppercase tracking-tighter">順位割合</span>
           <RankBarChart data={stats.rankDist} />
        </div>
      </div>
    </div>
  );
}