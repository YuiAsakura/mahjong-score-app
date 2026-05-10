// app/stats/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { calculateGlobalStats, calculateSessionStats, StatsResult } from "@/lib/crud/stats";
import { getSession } from "@/lib/crud/sessions";
import { Button } from "@/components/common/Button";

function StatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [data, setData] = useState<StatsResult | null>(null);
  const [activeTab, setActiveTab] = useState<"4p" | "3p">("4p");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("通算戦績分析");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (sessionId) {
        const session = await getSession(sessionId);
        if (session) {
          const result = await calculateSessionStats(sessionId, session.members);
          setData(result);
          setTitle(`${new Date(session.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}の分析`);
        }
      } else {
        const result = await calculateGlobalStats();
        setData(result);
        setTitle("全期間の通算戦績");
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
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">{title}</h1>
        <div className="flex gap-2 mt-8 bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => setActiveTab("4p")} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "4p" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400"}`}>四人麻雀</button>
          <button onClick={() => setActiveTab("3p")} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "3p" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400"}`}>三人麻雀</button>
        </div>
      </header>

      <div className="px-4 space-y-6">
        {currentStats.length === 0 ? (
          <div className="bg-white p-16 rounded-[40px] text-center text-slate-400 font-bold">データがありません</div>
        ) : (
          currentStats.map(user => {
            // 和了率 = (和了数 / 参加局数) * 100
            const winRate = user.totalRounds > 0 ? ((user.winCount / user.totalRounds) * 100).toFixed(1) : "0.0";
            // 放銃率 = (放銃数 / 参加局数) * 100
            const dealInRate = user.totalRounds > 0 ? ((user.dealInCount / user.totalRounds) * 100).toFixed(1) : "0.0";
            // ツモ率 = (ツモ数 / 和了数) * 100
            const tsumoRate = user.winCount > 0 ? ((user.tsumoCount / user.winCount) * 100).toFixed(1) : "0.0";
            // 1位率 = (1位回数 / 対局数) * 100
            const firstRate = user.totalHanchans > 0 ? ((user.ranks[1] / user.totalHanchans) * 100).toFixed(1) : "0.0";

            return (
              <div key={user.name} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">{user.name}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{user.totalHanchans} Matches / {user.totalRounds} Rounds</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-300 uppercase">Avg Score</div>
                    <div className="text-sm font-black text-slate-700">{user.totalHanchans ? Math.round(user.totalScore / user.totalHanchans).toLocaleString() : 0}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-2">和了率 / 放銃率</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-emerald-500">{winRate}%</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-xl font-black text-rose-500">{dealInRate}%</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-2">1位率 / ツモ率</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-amber-500">{firstRate}%</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-xl font-black text-blue-500">{tsumoRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex h-10 w-full rounded-2xl overflow-hidden bg-slate-50 p-1 border">
                  {[1, 2, 3, 4].slice(0, activeTab === "4p" ? 4 : 3).map(r => {
                    const width = user.totalHanchans ? (user.ranks[r] / user.totalHanchans * 100) : 0;
                    const colors = ["bg-amber-400", "bg-slate-300", "bg-orange-400", "bg-slate-800"];
                    return width > 0 ? (
                      <div key={r} style={{ width: `${width}%` }} className={`${colors[r-1]} h-full flex flex-col items-center justify-center border-r last:border-r-0 border-white/20`}>
                        <span className="text-[10px] font-black text-white">{r}位</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            );
          })
        )}
        <Button onClick={() => router.push('/')} variant="secondary" className="w-full py-4 mt-4">トップへ戻る</Button>
      </div>
    </main>
  );
}

export default function StatsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StatsContent />
    </Suspense>
  );
}