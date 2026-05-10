// app/session/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getSession, deleteSession } from "@/lib/crud/sessions"; // deleteSessionを追加
import { getHanchans } from "@/lib/crud/hanchans";
import { Button } from "@/components/common/Button";
import { Session } from "@/lib/types/session";
import { Hanchan } from "@/lib/types/hanchan";

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const router = useRouter();
  
  const [session, setSession] = useState<Session | null>(null);
  const [hanchans, setHanchans] = useState<Hanchan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const s = await getSession(sessionId);
      const h = await getHanchans(sessionId);
      if (s) setSession(s);
      setHanchans(h);
      setLoading(false);
    };
    fetchData();
  }, [sessionId]);

  // 削除処理
  const handleDeleteSession = async () => {
    if (!window.confirm("このセッション（グループ）を削除しますか？内の対局データもすべて見られなくなります。")) {
      return;
    }

    try {
      await deleteSession(sessionId);
      router.push("/"); // 削除後はトップへ
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました。");
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-black animate-pulse">LOADING...</div>;
  if (!session) return <div className="p-12 text-center text-red-500">セッションが見つかりません</div>;

  return (
    <main className="min-h-screen bg-slate-50 max-w-md mx-auto pb-24">
      {/* ヘッダー */}
      <header className="bg-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm mb-8 relative">
        {/* 削除ボタン */}
        <button 
          onClick={handleDeleteSession}
          className="absolute top-12 right-6 w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
          title="セッションを削除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Session Detail</span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
            {new Date(session.date).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {session.members.map(m => (
              <span key={m} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                {m}
              </span>
            ))}
          </div>

          <button 
            onClick={() => router.push(`/stats?sessionId=${sessionId}`)}
            className="mt-4 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-100 active:scale-95 transition-all w-full"
          >
            📊 このセッションの戦績を分析する
          </button>
        </div>
      </header>

      <div className="px-4 space-y-4">
        <h2 className="px-2 text-xs font-black text-slate-400 uppercase tracking-widest">Match History</h2>
        
        {hanchans.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">
            まだ対局がありません
          </div>
        ) : (
          hanchans.map((h, index) => {
            const isCompleted = h.status === "completed";
            const rankings = Object.entries(h.finalScore).sort(([, a], [, b]) => b - a);

            return (
              <div 
                key={h.id} 
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/hanchan/${h.id}?sessionId=${sessionId}`)}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-black text-slate-800">第 {index + 1} 回戦</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isCompleted ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600 animate-pulse"
                  }`}>
                    {isCompleted ? "対局終了" : "進行中"}
                  </span>
                </div>

                <div className="space-y-2">
                  {rankings.map(([name, score], rankIndex) => (
                    <div key={name} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${
                          rankIndex === 0 ? "bg-yellow-400 text-white" : "bg-slate-100 text-slate-400"
                        }`}>
                          {rankIndex + 1}
                        </span>
                        <span className={`text-sm font-bold ${rankIndex === 0 ? "text-slate-800" : "text-slate-500"}`}>
                          {name}
                        </span>
                      </div>
                      <span className={`text-sm font-black tabular-nums ${score < 0 ? "text-red-500" : "text-slate-700"}`}>
                        {score.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        <Button 
          onClick={() => router.push(`/session/${sessionId}/hanchan/new`)} 
          className="w-full py-4 mt-4"
        >
          新しい対局を開始
        </Button>
        
        <Button 
          onClick={() => router.push("/")} 
          variant="secondary" 
          className="w-full py-4"
        >
          トップページに戻る
        </Button>
      </div>
    </main>
  );
}