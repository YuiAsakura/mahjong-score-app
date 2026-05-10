// components/hanchan/ScoreTable.tsx
import React from "react";

interface ScoreTableProps {
  players: string[];
  scores: Record<string, number>;
  seats: Record<string, string>;
  parent: string;
}

export const ScoreTable: React.FC<ScoreTableProps> = ({ players, scores, seats, parent }) => {
  return (
    <div className="grid grid-cols-2 gap-2 mb-6">
      {players.map((name) => {
        const isParent = name === parent;
        return (
          <div key={name} className={`p-3 rounded-xl border-2 ${isParent ? "border-orange-400 bg-orange-50" : "bg-white border-gray-100"}`}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-gray-500">
                {Object.keys(seats).find(k => seats[k as keyof typeof seats] === name) === "east" ? "東" : 
                 Object.keys(seats).find(k => seats[k as keyof typeof seats] === name) === "south" ? "南" :
                 Object.keys(seats).find(k => seats[k as keyof typeof seats] === name) === "west" ? "西" : "北"}
                {isParent && " (親)"}
              </span>
            </div>
            <div className="text-sm font-bold truncate">{name}</div>
            <div className={`text-xl font-black ${scores[name] < 0 ? "text-red-500" : "text-gray-800"}`}>
              {scores[name].toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};