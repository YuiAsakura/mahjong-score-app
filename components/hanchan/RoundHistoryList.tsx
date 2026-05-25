"use client";

import { useEffect, useState } from "react";
import { getAllRounds } from "@/lib/crud/rounds";
import { Round } from "@/lib/types/round";

interface Props {
  sessionId: string;
  hanchanId: string;
}

export const RoundHistoryList = ({ sessionId, hanchanId }: Props) => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRounds() {
      if (!sessionId || !hanchanId) return;
      try {
        const data = await getAllRounds(sessionId, hanchanId);
        setRounds(data);
      } catch (error) {
        console.error("局データの取得失敗:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRounds();
  }, [sessionId, hanchanId]);

  if (loading) return <div className="text-center p-4 text-slate-400 font-bold text-xs animate-pulse">履歴読み込み中...</div>;
  if (rounds.length === 0) return null;

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 text-center">
        Round History
      </h2>
      <div className="space-y-3">
        {rounds.map((r) => (
          <div key={r.id} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-sm">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2 mb-2">
              <span className="font-black text-slate-800">{r.roundName}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                {r.honba}本場
              </span>
            </div>

            {r.resultType === "agari" && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 font-bold">
                  <span className="text-orange-500 font-black">和了</span>
                  <span className="text-slate-800">{r.winner}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded">
                    {r.tsumoOrRon === "tsumo" ? "ツモ" : "ロン"}
                  </span>
                  {r.tsumoOrRon === "ron" && r.loser && (
                    <span className="text-slate-500 text-xs">（放銃: {r.loser}）</span>
                  )}
                </div>
                {(r.han !== undefined || r.roleText) && (
                  <div className="p-2 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600">
                    {r.han !== undefined && <div><span className="font-black text-slate-700">{r.han} 翻</span></div>}
                    {r.roleText && <div>役: <span className="font-bold text-slate-700">{r.roleText}</span></div>}
                  </div>
                )}
              </div>
            )}

            {r.resultType === "ryukyoku" && (
              <div className="font-bold text-slate-500 text-xs">
                <span className="text-blue-500 font-black mr-2">流局</span>
                {r.tenpaiPlayers?.length ? `聴牌: ${r.tenpaiPlayers.join(", ")}` : "全員ノーテン"}
              </div>
            )}

            {r.resultType === "chonbo" && (
              <div className="font-bold text-red-500 text-xs">
                <span className="font-black mr-2">チョンボ</span> 違反者: {r.offender}
              </div>
            )}

            {r.memo && <div className="mt-2 text-xs text-slate-400 italic">📝 {r.memo}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};