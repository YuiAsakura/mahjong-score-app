"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@/lib/types/session";
import { getSession } from "@/lib/crud/sessions";
import { createHanchan } from "@/lib/crud/hanchans";
import { Button } from "@/components/common/Button";
import { HanchanType } from "@/lib/types/hanchan";

export default function NewHanchanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [type, setType] = useState<HanchanType>("4p-tonnan");
  const [seats, setSeats] = useState({ east: "", south: "", west: "", north: "" });

  useEffect(() => {
    getSession(sessionId).then(setSession);
  }, [sessionId]);

  const handleStart = async () => {
    if (!seats.east || !seats.south || !seats.west || (type === "4p-tonnan" && !seats.north)) {
      return alert("座席をすべて埋めてください");
    }

    const players = type === "4p-tonnan" 
      ? [seats.east, seats.south, seats.west, seats.north]
      : [seats.east, seats.south, seats.west];

    const hanchanId = await createHanchan(sessionId, {
      type,
      players,
      seats,
      initialScore: type === "4p-tonnan" ? 25000 : 35000,
      finalScore: Object.fromEntries(players.map(p => [p, type === "4p-tonnan" ? 25000 : 35000]))
    });

    router.push(`/hanchan/${hanchanId}?sessionId=${sessionId}`);
  };

  if (!session) return null;

  return (
    <main className="min-h-screen bg-white p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">新規半荘開始</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">ルール</label>
          <select 
            className="w-full p-3 border rounded-lg bg-gray-50"
            value={type}
            onChange={(e) => setType(e.target.value as HanchanType)}
          >
            <option value="4p-tonnan">四麻 (25000点持)</option>
            <option value="3p-tonnan">三麻 (35000点持)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <h2 className="font-bold text-sm text-gray-500">座席割り当て</h2>
          {["east", "south", "west", "north"].map((dir) => (
            (dir !== "north" || type === "4p-tonnan") && (
              <div key={dir} className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-full text-xs font-bold">
                  {dir === "east" ? "東" : dir === "south" ? "南" : dir === "west" ? "西" : "北"}
                </span>
                <select
                  className="flex-1 p-3 border rounded-lg"
                  value={seats[dir as keyof typeof seats]}
                  onChange={(e) => setSeats({ ...seats, [dir]: e.target.value })}
                >
                  <option value="">選択してください</option>
                  {session.members.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )
          ))}
        </div>

        <Button onClick={handleStart} className="mt-8">対局開始</Button>
      </div>
    </main>
  );
}