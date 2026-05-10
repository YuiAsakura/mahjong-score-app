// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessions } from "@/lib/crud/sessions";
import { Button } from "@/components/common/Button";
import { Session } from "@/lib/types/session";

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      const data = await getSessions();
      setSessions(data);
      setLoading(false);
    };
    fetchSessions();
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-400 font-black animate-pulse">LOADING...</div>;

  return (
    <main className="min-h-screen bg-slate-50 max-w-md mx-auto pb-12">
      {/* ヘッダー・ヒーローセクション */}
      <header className="bg-white px-6 pt-16 pb-10 rounded-b-[40px] shadow-sm mb-8 border-b border-slate-100">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Mahjong Manager</span>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">まーじゃんログ</h1>
        </div>

        {/* --- 通算分析ボタン (ここを追加) --- */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/stats')}
            className="w-full group relative overflow-hidden bg-slate-900 p-6 rounded-3xl transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            {/* 背景の装飾 */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">
                📊
              </div>
              <div className="text-left">
                <div className="text-white font-black text-lg">通算戦績を表示</div>
                <div className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Global Analytics Hub</div>
              </div>
              <div className="ml-auto text-slate-500 group-hover:text-white transition-colors">
                <i className="fa-solid fa-chevron-right"></i>
              </div>
            </div>
          </button>
        </div>
      </header>

      <div className="px-4 space-y-6">
        {/* 新規セッションボタン */}
        <div className="px-2 flex justify-between items-end">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Sessions</h2>
          <Button 
            onClick={() => router.push("/sessions/new")}
            variant="secondary"
            className="py-2 text-[10px]"
          >
            + 新規作成
          </Button>
        </div>

        {/* セッションリスト */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white p-12 rounded-[32px] border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold">
              セッションがありません
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => router.push(`/session/${session.id}`)}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Session Date</span>
                    <h3 className="text-xl font-black text-slate-800">
                      {new Date(session.date).toLocaleDateString("ja-JP", {
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.members.map((member) => (
                    <span
                      key={member}
                      className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-500"
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}