// app/sessions/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/lib/crud/sessions";
import { getUsers, UserMaster } from "@/lib/crud/user"
import { Button } from "@/components/common/Button";

export default function NewSessionPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [allUsers, setAllUsers] = useState<UserMaster[]>([]); 
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await getUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("ユーザーの取得に失敗しました:", error);
      }
    }
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMembers.length === 0) return alert("メンバーを選択してください");
    setIsSubmitting(true);
    
    try {
      const { addUser } = await import("@/lib/crud/user"); // その場でインポート
      // まだマスターにいない名前を抽出して登録
      const existingNames = allUsers.map(u => u.name);
      const newNames = selectedMembers.filter(name => !existingNames.includes(name));
      
      // 未登録の名前があれば Firestore の /users に保存
      await Promise.all(newNames.map(name => addUser(name)));
    } catch (e) {
      console.error("ユーザーマスターへの登録に失敗しましたが、続行します", e);
    }

    try {
      const sessionId = await createSession({
        date,
        members: selectedMembers,
        memo,
      });
      router.push(`/session/${sessionId}`);
    } catch (error) {
      console.error(error);
      alert("作成に失敗しました");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-6">新規セッション作成</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

<div>
            <label className="block text-sm font-black text-slate-700 mb-2">
              参加メンバーを選択
            </label>

            <div className="flex flex-wrap gap-2 mb-6 p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 min-h-[60px] items-center">
              {selectedMembers.length > 0 ? (
                selectedMembers.map(name => (
                  <span 
                    key={name} 
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 shadow-sm flex items-center gap-1"
                  >
                    {name}
                    <button 
                      type="button" 
                      onClick={() => setSelectedMembers(prev => prev.filter(n => n !== name))}
                      className="text-slate-400 hover:text-red-500 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 font-bold italic mx-auto">メンバーが選択されていません</p>
              )}
            </div>
            
            {/* 1. マスターから選ぶチップリスト */}
            <div className="flex flex-wrap gap-2 mb-4">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setSelectedMembers(prev => 
                      prev.includes(user.name) 
                        ? prev.filter(n => n !== user.name) 
                        : [...prev, user.name]
                    );
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${
                    selectedMembers.includes(user.name)
                      ? "bg-slate-800 text-white border-slate-800 shadow-md scale-105"
                      : "bg-white text-slate-400 border-slate-200"
                  }`}
                >
                  {user.name}
                </button>
              ))}
            </div>

            {/* 2. マスターにいない人をその場で追加する欄 */}
            <div className="flex gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <input
                type="text"
                placeholder="新しいメンバーを一時追加"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="flex-1 bg-transparent px-3 py-1 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newMemberName.trim()) return;
                  if (!selectedMembers.includes(newMemberName.trim())) {
                    setSelectedMembers([...selectedMembers, newMemberName.trim()]);
                  }
                  setNewMemberName("");
                }}
                className="bg-white px-4 py-1 rounded-xl text-[10px] font-black text-slate-600 shadow-sm"
              >
                追加
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="例: 第1回 忘年会リーグ"
              className="w-full p-3 border rounded-lg h-24"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "作成中..." : "セッション開始"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}