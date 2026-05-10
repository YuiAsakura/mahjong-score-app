// app/session/[id]/hanchan/new/page.tsx
"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { createHanchan } from "@/lib/crud/hanchans";
import { Button } from "@/components/common/Button";
import { HanchanType } from "@/lib/types/hanchan";

export default function NewHanchanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const router = useRouter();

  const [type, setType] = useState<HanchanType>("4p-tonnan");
  const [players, setPlayers] = useState<string[]>(["", "", "", ""]);
  const [seats, setSeats] = useState({
    east: "",
    south: "",
    west: "",
    north: "",
  });

  const handleCreate = async () => {
    // バリデーション（空文字チェック等）
    if (players.some(p => p === "")) {
      alert("プレイヤー名を全員分入力してください");
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
        startScore: startScore, // ← エラー箇所：initialScoreから修正
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

  return (
    <main className="min-h-screen bg-slate-50 max-w-md mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">新規対局</h1>
        <p className="text-slate-400 font-bold text-sm">Create New Match</p>
      </header>

      <div className="space-y-8">
        {/* ルール選択 */}
        <section>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Rule Type</label>
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl">
            {(["4p-tonnan", "3p-tonnan", "3p-ton"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  if (t.startsWith("3p")) {
                    setPlayers(prev => prev.slice(0, 3));
                  } else {
                    setPlayers(["", "", "", ""]);
                  }
                }}
                className={`py-2.5 rounded-xl text-[10px] font-black transition-all ${
                  type === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-400"
                }`}
              >
                {t === "4p-tonnan" ? "四麻" : t === "3p-tonnan" ? "三麻(南)" : "三麻(東)"}
              </button>
            ))}
          </div>
        </section>

        {/* プレイヤー入力 */}
        <section className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Players / Seats</label>
          {players.map((p, i) => (
            <div key={i} className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 w-8">
                {["東", "南", "西", "北"][i]}
              </span>
              <input
                type="text"
                value={p}
                onChange={(e) => {
                  const newPlayers = [...players];
                  newPlayers[i] = e.target.value;
                  setPlayers(newPlayers);
                }}
                placeholder={`プレイヤー ${i + 1}`}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm focus:border-blue-500 outline-none transition-all"
              />
            </div>
          ))}
        </section>

        <Button onClick={handleCreate} className="w-full py-5 shadow-xl shadow-blue-100">
          対局を開始する
        </Button>
      </div>
    </main>
  );
}