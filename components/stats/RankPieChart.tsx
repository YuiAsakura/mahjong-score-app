// components/stats/RankPieChart.tsx
"use client";

interface RankPieChartProps {
  data: {
    1: number;
    2: number;
    3: number;
    4?: number;
  };
}

export function RankPieChart({ data }: RankPieChartProps) {
  const total = (data[1] || 0) + (data[2] || 0) + (data[3] || 0) + (data[4] || 0);
  if (total === 0) return <div className="text-[10px] text-slate-300">No Data</div>;

  const getPercent = (val: number = 0) => (val / total) * 100;

  // 順位ごとの色設定（麻雀っぽく）
  const colors = ["#fbbf24", "#94a3b8", "#b45309", "#1e293b"]; // 金、銀、銅、黒

  let cumulativePercent = 0;

  // 簡易的な円グラフ（扇形を重ねる）
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90 rounded-full bg-slate-100">
      {[1, 2, 3, 4].map((rank, i) => {
        const val = data[rank as 1 | 2 | 3 | 4] || 0;
        const percent = getPercent(val);
        if (percent === 0) return null;

        const strokeDasharray = `${percent} 100`;
        const strokeDashoffset = -cumulativePercent;
        cumulativePercent += percent;

        return (
          <circle
            key={rank}
            cx="16"
            cy="16"
            r="16"
            fill="none"
            stroke={colors[i]}
            strokeWidth="32"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        );
      })}
    </svg>
  );
}