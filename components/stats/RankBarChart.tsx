// components/stats/RankBarChart.tsx
"use client";

interface RankBarChartProps {
  data: {
    1: number;
    2: number;
    3: number;
    4: number;
  };
}

export function RankBarChart({ data }: RankBarChartProps) {
  const total = (data[1] || 0) + (data[2] || 0) + (data[3] || 0) + (data[4] || 0);
  
  if (total === 0) {
    return <div className="w-full h-4 bg-slate-100 rounded-full flex items-center justify-center text-[8px] text-slate-300">NO DATA</div>;
  }

  const getWidth = (val: number) => `${((val / total) * 100).toFixed(1)}%`;

  // 順位ごとの色設定（1位:金, 2位:銀, 3位:銅, 4位:黒）
  const colors = ["#fbbf24", "#94a3b8", "#b45309", "#1e293b"];

  return (
    <div className="w-full">
      <div className="flex h-4 w-full rounded-full overflow-hidden shadow-inner bg-slate-200">
        {[1, 2, 3, 4].map((rank, i) => (
          <div
            key={rank}
            style={{ width: getWidth(data[rank as 1|2|3|4] || 0), backgroundColor: colors[i] }}
            className="h-full transition-all duration-500"
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[8px] font-black text-slate-400">
        <span>1st</span>
        <span>2nd</span>
        <span>3rd</span>
        <span>4th</span>
      </div>
    </div>
  );
}