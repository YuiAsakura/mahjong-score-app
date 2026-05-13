// app/hanchan/[hanchanId]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getHanchan, updateHanchan } from "@/lib/crud/hanchans";
import { createRound } from "@/lib/crud/rounds";
import { ScoreTable } from "@/components/hanchan/ScoreTable";
import { RoundInputForm } from "@/components/hanchan/RoundInputForm";
import { Button } from "@/components/common/Button"; // ← ここを追加しました
import { advanceRound, getCurrentRoundName } from "@/lib/round/roundProgress";
import { shouldEnterWest } from "@/lib/round/roundName";
import { calculateScore } from "@/lib/score/calculator";
import { Hanchan } from "@/lib/types/hanchan";

export default function HanchanPage({ params }: { params: Promise<{ hanchanId: string }> }) {
  const { hanchanId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId") || "";

  const [hanchan, setHanchan] = useState<Hanchan | null>(null);
  const [gameState, setGameState] = useState({ roundIndex: 0, honba: 0, parentSeatIndex: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId || !hanchanId) return;
      const h = await getHanchan(sessionId, hanchanId);
      if (h) {
        setHanchan(h);
        // 保存されている局情報があれば復元
        if (h.lastRoundIndex !== undefined) {
          setGameState({
            roundIndex: h.lastRoundIndex,
            honba: h.lastHonba || 0,
            parentSeatIndex: h.lastParentSeatIndex || 0
          });
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [sessionId, hanchanId]);

  const handleRoundSubmit = async (data: any) => {
    if (!hanchan || hanchan.status === "completed") return;

    const parentName = hanchan.players[gameState.parentSeatIndex];
    const is3p = hanchan.type !== "4p-tonnan";
    const numPlayers = hanchan.players.length;
    let scoreDelta: Record<string, number> = {};

    // 1. スコア計算
    if (data.resultType === "agari") {
      const result = calculateScore({
        ...data,
        isParent: data.winner === parentName,
        isTsumo: data.tsumoOrRon === "tsumo",
        isThreePlayer: is3p,
        parentSeat: parentName,
        winnerSeat: data.winner,
        loserSeat: data.loser,
        allPlayers: hanchan.players,
        honba: gameState.honba,
      });
      scoreDelta = result.payout;
    } else if (data.resultType === "ryukyoku") {
      const tenpai = data.tenpaiPlayers || [];
      if (tenpai.length > 0 && tenpai.length < numPlayers) {
        const receive = 3000 / tenpai.length;
        const pay = 3000 / (numPlayers - tenpai.length);
        hanchan.players.forEach(p => scoreDelta[p] = tenpai.includes(p) ? receive : -pay);
      } else {
        hanchan.players.forEach(p => (scoreDelta[p] = 0));
      }
    } else if (data.resultType === "chonbo") {
      const penalty = (data.offender === parentName) ? 4000 : 2000;
      hanchan.players.forEach(p => {
        scoreDelta[p] = (p === data.offender) ? -penalty * (numPlayers - 1) : penalty;
      });
    }

    // 2. 新スコア算出
    const newFinalScore = { ...hanchan.finalScore };
    Object.keys(scoreDelta).forEach(name => {
      newFinalScore[name] = (newFinalScore[name] || 0) + scoreDelta[name];
    });

    // 3. 親のトップ終了判定用ランキング算出
    const sortedScores = Object.entries(newFinalScore).sort((a, b) => b[1] - a[1]);
    const isParentTop = sortedScores[0][0] === parentName;

    // 4. 局進行計算
    const nextState = advanceRound(hanchan.players, gameState, data, Object.values(newFinalScore), is3p);

    // 5. 終了判定（オーラス判定）
    const isLastRound = (!is3p && gameState.roundIndex >= 7) || (is3p && gameState.roundIndex >= 5);
    
    // あがりやめ・テンパイやめ判定
    let isAgariYame = false;
    if (isLastRound) {
      if (data.resultType === "agari" && data.winner === parentName && isParentTop) isAgariYame = true;
      if (data.resultType === "ryukyoku" && (data.tenpaiPlayers || []).includes(parentName) && isParentTop) isAgariYame = true;
    }

    const westEntry = shouldEnterWest(is3p, nextState.roundIndex, Object.values(newFinalScore));
    const isGameOver = isAgariYame || (isLastRound && (nextState.roundIndex > gameState.roundIndex) && !westEntry);

    // 6. 保存データ整理
    const roundSaveData: any = {
      ...data,
      roundName: getCurrentRoundName(gameState, is3p),
      honba: gameState.honba,
      parent: parentName,
      scoreDelta,
      memo: data.roleText || ""
    };
    Object.keys(roundSaveData).forEach(key => roundSaveData[key] === undefined && delete roundSaveData[key]);

    try {
      // 7. Firestore更新（ステータスと局情報を永続化）
      await updateHanchan(sessionId, hanchanId, { 
        finalScore: newFinalScore,
        status: isGameOver ? "completed" : "active",
        lastRoundIndex: nextState.roundIndex,
        lastHonba: nextState.honba,
        lastParentSeatIndex: nextState.parentSeatIndex
      });
      await createRound(sessionId, hanchanId, roundSaveData);

      if (isGameOver) {
        alert("半荘終了です！お疲れ様でした。");
        setHanchan({ ...hanchan, finalScore: newFinalScore, status: "completed" });
      } else {
        setHanchan({ ...hanchan, finalScore: newFinalScore });
        setGameState(nextState);
        window.scrollTo(0, 0);
      }
    } catch (e) {
      console.error(e);
      alert("データの保存に失敗しました");
    }
  };

  if (loading || !hanchan) return <div className="p-12 text-center text-slate-400 font-black animate-pulse">LOADING...</div>;

  return (
    <main className="min-h-screen bg-slate-50 max-w-md mx-auto pb-80">
      <header className="bg-white px-6 pt-10 pb-6 rounded-b-[40px] shadow-sm mb-6 border-b border-slate-100 sticky top-0 z-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">
              {hanchan.status === "completed" ? "対局終了" : getCurrentRoundName(gameState, hanchan.type !== "4p-tonnan")}
            </h1>
            <p className="text-slate-400 font-bold mt-2 text-sm">
              {hanchan.status === "completed" ? "結果確定" : `${gameState.honba} 本場`}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            hanchan.status === "completed" ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600"
          }`}>
            {hanchan.status === "completed" ? "FINISHED" : (hanchan.type === "4p-tonnan" ? "4-Player" : "3-Player")}
          </span>
        </div>
      </header>

      <div className="px-4">
        <ScoreTable 
          players={hanchan.players} 
          scores={hanchan.finalScore} 
          seats={{
            ...hanchan.seats,
            north: hanchan.seats.north ?? "" // null の場合は空文字として渡す
          }}
          parent={hanchan.status === "completed" ? "" : hanchan.players[gameState.parentSeatIndex]}
        />
        
        {/* 終了時のみ表示されるボタン */}
        {hanchan.status === "completed" && (
          <div className="space-y-3 mt-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Game Results</div>
            <Button 
              onClick={() => router.push(`/session/${sessionId}`)} 
              variant="secondary" 
              className="w-full py-4 text-lg"
            >
              対局一覧に戻る
            </Button>
          </div>
        )}
      </div>

      {/* 進行中のみ表示される入力フォーム */}
      {hanchan.status !== "completed" && (
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="max-w-md mx-auto">
            <RoundInputForm players={hanchan.players} onSubmit={handleRoundSubmit} />
          </div>
        </div>
      )}
    </main>
  );
}