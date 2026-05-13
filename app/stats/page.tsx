// app/stats/page.tsx
"use client";

import { useEffect, useState } from "react";
import { calculateGlobalStats, StatsResult } from "@/lib/crud/stats";
import { UserStatCard } from "@/components/stats/UserCard";

export default function GlobalStatsPage() {
  const [data, setData] = useState<StatsResult | null>(null);
  const [activeTab, setActiveTab] = useState<"4p" | "3p">("4p");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await calculateGlobalStats();
        setData(result);
        if (result["4p"].length === 0 && result["3p"].length > 0) {
          setActiveTab("3p");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">分析中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 max-w-md mx-auto p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">戦績分析</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Global Analytics</p>
      </header>

      <div className="flex gap-2 mb-6 bg-slate-200/50 p-1.5 rounded-2xl">
        {(["4p", "3p"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
              activeTab === tab 
                ? "bg-white text-slate-800 shadow-md scale-[1.02]" 
                : "text-slate-400 hover:text-slate-500"
            }`}
          >
            {tab === "4p" ? "四人麻雀" : "三人麻雀"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {data && data[activeTab].length > 0 ? (
          data[activeTab].map((user) => (
            <UserStatCard 
              key={user.name} 
              /* ここで、user オブジェクトを UserStatCard が期待する
                 プロパティ名に変換して渡します。
              */
              stats={{
                userName: user.name,
                totalHanchans: user.totalHanchans,
                agariRate: user.agariRate,
                houjuRate: user.houjuRate,
                avgAgariScore: user.avgAgariScore,
                tsumoRate: user.tsumoRate,
                rankDist: {
                  1: user.ranks[1] || 0,
                  2: user.ranks[2] || 0,
                  3: user.ranks[3] || 0,
                  4: user.ranks[4] || 0,
                }
              }} 
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-200">
            <p className="text-slate-300 font-black text-sm uppercase tracking-widest">No Data Available</p>
          </div>
        )}
      </div>
    </main>
  );
}