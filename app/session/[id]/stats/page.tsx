// app/session/[id]/stats/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { calculateSessionStats, UserStats, StatsResult } from "@/lib/crud/stats";
import { getSession } from "@/lib/crud/sessions";
import { Button } from "@/components/common/Button";

export default function StatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<StatsResult | null>(null);
  const [activeTab, setActiveTab] = useState<"4p" | "3p">("4p");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession(sessionId);
      if (session) {
        const result = await calculateSessionStats(sessionId, session.members);
        setData(result);
        // データがある方のタブをデフォルトにする
        if (result["4p"].length === 0 && result["3p"].length > 0) setActiveTab("3p");
      }
      setLoading(false);
    };
    fetchData();
  }, [sessionId]);

  if (loading) return <div className="p-12 text-center text-slate-400 font-black animate-pulse">ANALYZING...</div>;

  const currentStats = data ? data[activeTab] : [];

  return (
    <main className="min-h-screen bg-slate-50 max-w-2xl mx-auto pb-12">
      <header className="bg-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm mb-6">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">戦績分析</h1>
        
        {/* 三麻・四麻切り替えタブ */}
        <div className="flex gap-2 mt-6 bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab("4p")}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${activeTab === "4p" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400"}`}
          >
            四人麻雀
          </button>
          <button 
            onClick={() => setActiveTab("3p")}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${activeTab === "3p" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400"}`}
          >
            三人麻雀
          </button>
        </div>
      </header>

      <div className="px-4 space-y-6">
        {currentStats.length === 0 ? (
          <div className="bg-white p-12 rounded-[32px] text-center text-slate-400 font-bold">
            このルールのデータはまだありません
          </div>
        ) : (
          currentStats.map(user => {
            const pCount = activeTab === "4p" ? 4 : 3;
            // 1局あたりの期待値をベースに率を算出
            const adjustedRounds = user.totalRounds / pCount;
            const agariRate = adjustedRounds ? (user.winCount / adjustedRounds * 100).toFixed(1) : "0";
            const dealInRate = adjustedRounds ? (user.dealInCount / adjustedRounds * 100).toFixed(1) : "0";
            const tsumoRate = user.winCount ? (user.tsumoCount / user.winCount * 100).toFixed(1) : "0";
            const firstRate = user.totalHanchans ? (user.ranks[1] / user.totalHanchans * 100).toFixed(1) : "0";

            return (
              <div key={user.name} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-800">{user.name}</h2>
                  <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                    {user.totalHanchans} MATCHES / {user.totalRounds} ROUNDS
                  </span>
                </div>

                {/* 数値スタッツ */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">和了率 / 放銃率</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-green-500">{agariRate}%</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-xl font-black text-red-500">{dealInRate}%</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">1位率 / ツモ率</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-yellow-500">{firstRate}%</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-xl font-black text-blue-500">{tsumoRate}%</span>
                    </div>
                  </div>
                </div>

                {/* 順位分布バー */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank Distribution</span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {activeTab === "4p" ? "1位 - 4位" : "1位 - 3位"}
                    </span>
                  </div>
                  <div className="flex h-10 w-full rounded-2xl overflow-hidden bg-slate-100 p-1">
                    {[1, 2, 3, 4].slice(0, pCount).map(r => {
                      const width = user.totalHanchans ? (user.ranks[r] / user.totalHanchans * 100) : 0;
                      const colors = ["bg-yellow-400", "bg-slate-300", "bg-orange-400", "bg-slate-800"];
                      return width > 0 ? (
                        <div 
                          key={r} 
                          style={{ width: `${width}%` }} 
                          className={`${colors[r-1]} h-full first:rounded-l-xl last:rounded-r-xl border-r last:border-r-0 border-white/20 flex items-center justify-center text-[10px] font-black text-white`}
                        >
                          {width > 10 ? `${r}位` : r}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <Button onClick={() => router.back()} variant="secondary" className="w-full py-4 mt-4">
          戻る
        </Button>
      </div>
    </main>
  );
}