// app/stats/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateGlobalStats, StatsResult, UserStats } from "@/lib/crud/stats";
import { UserCard } from "@/components/stats/UserCard";
import { ChevronLeft } from "lucide-react";

export default function GlobalStatsPage() {
  const [data, setData] = useState<StatsResult | null>(null);
  const [activeTab, setActiveTab] = useState<"4p" | "3p">("4p");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await calculateGlobalStats();
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">ANALYZING...</div>;

  return (
    <main className="min-h-screen bg-slate-50 max-w-md mx-auto p-6 pb-24">
      <header className="mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 mb-4 bg-white rounded-full shadow-sm text-slate-600 hover:text-slate-900 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">戦績分析</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Global Analytics</p>
      </header>

      <div className="flex gap-2 mb-6 bg-slate-200/50 p-1.5 rounded-2xl">
        {(["4p", "3p"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
              activeTab === tab ? "bg-white text-slate-800 shadow-md scale-[1.02]" : "text-slate-400"
            }`}
          >
            {tab === "4p" ? "四人麻雀" : "三人麻雀"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {data && data[activeTab].map((user: UserStats) => (
          <UserCard 
            key={user.name} 
            stats={{
              userName: user.name,
              totalHanchans: user.totalHanchans,
              agariRate: user.totalRounds > 0 ? parseFloat(((user.winCount / user.totalRounds) * 100).toFixed(1)) : 0,
              houjuRate: user.totalRounds > 0 ? parseFloat(((user.dealInCount / user.totalRounds) * 100).toFixed(1)) : 0,
              avgAgariScore: user.winCount > 0 ? Math.round(user.totalAgariScore / user.winCount) : 0,
              tsumoRate: user.winCount > 0 ? parseFloat(((user.tsumoCount / user.winCount) * 100).toFixed(1)) : 0,
              rankDist: {
                1: user.ranks[1] || 0,
                2: user.ranks[2] || 0,
                3: user.ranks[3] || 0,
                4: user.ranks[4] || 0,
              }
            }} 
          />
        ))}
      </div>
    </main>
  );
}