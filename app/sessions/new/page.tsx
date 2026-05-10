// app/sessions/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/lib/crud/sessions";
import { Button } from "@/components/common/Button";

export default function NewSessionPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [memberInput, setMemberInput] = useState("");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberInput.trim()) return alert("メンバーを入力してください");

    setIsSubmitting(true);
    const members = memberInput.split(/[、, ]/).filter((m) => m.trim() !== "");
    
    try {
      const sessionId = await createSession({
        date,
        members,
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              参加メンバー（カンマかスペース区切り）
            </label>
            <input
              type="text"
              placeholder="例: 山田, 田中, 佐藤, 鈴木"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
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