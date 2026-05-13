// app/session/[id]/hanchan/new/page.tsx
"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { createHanchan } from "@/lib/crud/hanchans";
import { Button } from "@/components/common/Button";
import { HanchanType } from "@/lib/types/hanchan";
import { ChevronLeft, UserPlus } from "lucide-react"; // アイコンライブラリを使用（未インストールの場合はSVGに置換可能）

export default function NewHanchanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const router = useRouter();

  const [type, setType] = useState<HanchanType>("4p-tonnan");
  const [players, setPlayers] = useState<string[]>(["", "", "", ""]);
  const [memberOptions, setMemberOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // セッションに紐づくメンバー一覧を取得
  useEffect(() => {
    async function fetchMembers() {
      try {
        const sessionDoc = await getDoc(doc(db, "sessions", sessionId));
        if (sessionDoc.exists()) {
          const data = sessionDoc.data();
          setMemberOptions(data.members || []);
        }
      } catch (e) {
        console.error("Error fetching members:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [sessionId]);

  const handleCreate = async () => {
    if (players.some(p => p === "")) {
      alert("プレイヤーを全員分選択してください");
      return;
    }

    try {
      const is4p = type === "4p-tonnan";
      const startScore = is4p ? 25000 : 35000;

      const hanchanId = await createHanchan(sessionId, {
        type,
        players: players.filter(p => p !== ""),
        seats: {
          east: players[0],
          south: players[1],
          west: players[2],
          north: is4p ? players[3] : undefined,
        },
        startScore: startScore,
        finalScore: Object.fromEntries(
          players.filter(p => p !== "").map(p => [p, startScore])
        ),
        status: "active",
      });

      router.push(`/hanchan/${hanchanId}?sessionId=${sessionId}`);
    } catch (e) {
      console.error(e);
      alert("対局の作成に失敗しました");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading...</div>;

  return (
    <main className="min-h-screen bg-slate-50 max-w-md mx-auto relative shadow-2xl shadow-slate-200">
      {/* ヘッダーエリア（戻るボタン追加） */}
      <header className="p-6 pb-0">
        <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-slate-900 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">
          NEW<br />MATCH
        </h1>
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-2">新規対局の開始</p>
      </header>

      <div className="p-6 space-y-8">
        {/* ルール選択セクション */}
        <section>
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
            Select Game Type
          </label>
          <div className="grid grid-cols-3 gap-2 bg-slate-200/50 p-1.5 rounded-2xl">
            {(["4p-tonnan", "3p-tonnan", "3p-ton"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setPlayers(t.startsWith("3p") ? ["", "", ""] : ["", "", "", ""]);
                }}
                className={`py-3 rounded-xl text-xs font-black transition-all ${
                  type === t ? "bg-white text-slate-800 shadow-md scale-[1.02]" : "text-slate-400 hover:text-slate-500"
                }`}
              >
                {t === "4p-tonnan" ? "四麻" : t === "3p-tonnan" ? "三麻(南)" : "三麻(東)"}
              </button>
            ))}
          </div>
        </section>

        {/* プレイヤー選択セクション */}
        <section className="space-y-4">
          <div className="flex justify-between items-end mb-1">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Assign Seats
            </label>
            <span className="text-[10px] font-bold text-slate-300">東 / 南 / 西 / 北</span>
          </div>
          
          <div className="space-y-3">
            {players.map((p, i) => (
              <div key={i} className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className={`text-[10px] font-black ${
                    ["text-orange-500", "text-blue-500", "text-green-600", "text-purple-500"][i]
                  }`}>
                    {["東", "南", "西", "北"][i]}
                  </span>
                </div>
                
                <select
                  value={p}
                  onChange={(e) => {
                    const newPlayers = [...players];
                    newPlayers[i] = e.target.value;
                    setPlayers(newPlayers);
                  }}
                  className="w-full pl-12 pr-10 py-5 bg-white border-2 border-transparent rounded-2xl text-sm font-black text-slate-800 shadow-sm focus:border-blue-500 focus:shadow-xl focus:shadow-blue-500/5 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>プレイヤーを選択</option>
                  {memberOptions.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
                
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                  <UserPlus size={18} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 下部固定風ボタン */}
        <div className="pt-4">
          <Button 
            onClick={handleCreate} 
            className="w-full py-6 rounded-3xl text-lg shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-transform"
          >
            対局データを生成
          </Button>
          <p className="text-center text-[10px] font-bold text-slate-300 mt-4 tracking-widest">
            CONFIRM ALL SEATS BEFORE STARTING
          </p>
        </div>
      </div>
    </main>
  );
}