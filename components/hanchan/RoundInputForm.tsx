// components/hanchan/RoundInputForm.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/common/Button";

interface RoundInputFormProps {
  players: string[];
  onSubmit: (data: any) => void;
}

export const RoundInputForm: React.FC<RoundInputFormProps> = ({ players, onSubmit }) => {
  const [resultType, setResultType] = useState<"agari" | "ryukyoku" | "chonbo">("agari");
  const [winner, setWinner] = useState(players[0]);
  const [loser, setLoser] = useState(players[1] || players[0]);
  const [tsumoOrRon, setTsumoOrRon] = useState<"tsumo" | "ron">("tsumo");
  const [han, setHan] = useState(1);
  const [fu, setFu] = useState(30);
  const [roleText, setRoleText] = useState("");
  const [tenpaiPlayers, setTenpaiPlayers] = useState<string[]>([]);
  const [offender, setOffender] = useState(players[0]);

  const handleSubmit = () => {
    onSubmit({
      resultType,
      winner,
      loser: tsumoOrRon === "ron" ? loser : undefined,
      tsumoOrRon,
      han: Number(han),
      fu: Number(fu),
      roleText,
      tenpaiPlayers,
      offender,
    });
    setRoleText("");
    setTenpaiPlayers([]);
  };

  return (
    <div className="bg-white p-6 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-slate-100">
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
        {(["agari", "ryukyoku", "chonbo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setResultType(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
              resultType === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-400"
            }`}
          >
            {t === "agari" ? "和了" : t === "ryukyoku" ? "流局" : "チョンボ"}
          </button>
        ))}
      </div>

      {resultType === "agari" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
            <button className={`flex-1 py-1.5 rounded-md text-xs font-bold ${tsumoOrRon === "tsumo" ? "bg-white shadow-sm text-blue-600" : "text-slate-400"}`} onClick={() => setTsumoOrRon("tsumo")}>ツモ</button>
            <button className={`flex-1 py-1.5 rounded-md text-xs font-bold ${tsumoOrRon === "ron" ? "bg-white shadow-sm text-blue-600" : "text-slate-400"}`} onClick={() => setTsumoOrRon("ron")}>ロン</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="p-2.5 bg-slate-50 border rounded-xl text-sm font-bold" value={winner} onChange={(e) => setWinner(e.target.value)}>
              {players.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {tsumoOrRon === "ron" && (
              <select className="p-2.5 bg-slate-50 border rounded-xl text-sm font-bold" value={loser} onChange={(e) => setLoser(e.target.value)}>
                {players.filter(p => p !== winner).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
          </div>
          <div className="flex gap-3">
            <select className="flex-1 p-2.5 bg-slate-50 border rounded-xl text-sm font-bold" value={han} onChange={(e) => setHan(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(v => (
                <option key={v} value={v}>{v}翻</option>
              ))}
              <option value={13}>13翻 (役満)</option>
              <option value={26}>26翻 (ダブル役満)</option>
              <option value={39}>39翻 (トリプル役満)</option>
            </select>
            <select className="flex-1 p-2.5 bg-slate-50 border rounded-xl text-sm font-bold" value={fu} onChange={(e) => setFu(Number(e.target.value))}>
              {[20,25,30,40,50,60,70,80,90,100,110].map(v => <option key={v} value={v}>{v}符</option>)}
            </select>
          </div>
          <input type="text" placeholder="役を入力 (例: 立直一発タンヤオ)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={roleText} onChange={(e) => setRoleText(e.target.value)} />
        </div>
      )}

      {resultType === "ryukyoku" && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 gap-2">
            {players.map(p => (
              <button key={p} onClick={() => setTenpaiPlayers(prev => prev.includes(p) ? prev.filter(x => x!==p) : [...prev, p])} className={`p-3 rounded-xl text-sm font-bold border-2 ${tenpaiPlayers.includes(p) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 bg-slate-50 text-slate-400"}`}>
                {p}: {tenpaiPlayers.includes(p) ? "聴牌" : "不聴"}
              </button>
            ))}
          </div>
        </div>
      )}

      {resultType === "chonbo" && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <select className="w-full p-4 bg-red-50 border border-red-100 rounded-xl text-sm font-bold text-red-700" value={offender} onChange={(e) => setOffender(e.target.value)}>
            {players.map(p => <option key={p} value={p}>{p} (チョンボ)</option>)}
          </select>
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full mt-6 py-4 shadow-xl shadow-blue-100">結果を登録</Button>
    </div>
  );
};