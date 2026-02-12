"use client";

import type { TeamData } from "@/lib/game-state";

interface InningBoardProps {
  home: TeamData;
  away: TeamData;
  currentInning: number;
  isTop: boolean;
}

export function InningBoard({ home, away, currentInning, isTop }: InningBoardProps) {
  const innings = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="border-b border-[#E5E7EB] bg-white">
      <table className="w-full border-collapse text-center">
        <thead>
          <tr>
            <th className="w-10 border-b border-r border-[#E5E7EB] py-1.5 text-[9px] font-bold tracking-widest text-[#9CA3AF]">{""}</th>
            {innings.map((i) => (
              <th key={i} className={`border-b border-r border-[#E5E7EB] py-1.5 text-[11px] font-bold ${
                i === currentInning ? "bg-[#2563EB] text-white" : "text-[#9CA3AF]"
              }`}>{i}</th>
            ))}
            <th className="border-b border-r border-[#E5E7EB] px-1 py-1.5 text-[10px] font-bold text-[#2563EB]">R</th>
            <th className="border-b border-r border-[#E5E7EB] px-1 py-1.5 text-[10px] font-bold text-[#9CA3AF]">H</th>
            <th className="border-b border-[#E5E7EB] px-1 py-1.5 text-[10px] font-bold text-[#9CA3AF]">E</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-r border-[#E5E7EB] py-1.5">
              <div className="flex items-center justify-center gap-0.5">
                {isTop && <span className="inline-block h-0 w-0 border-b-[5px] border-l-[4px] border-r-[4px] border-b-[#2563EB] border-l-transparent border-r-transparent" />}
                <span className="text-[10px] font-bold text-[#DC2626]">{away.shortName}</span>
              </div>
            </td>
            {innings.map((i) => (
              <td key={i} className={`border-b border-r border-[#E5E7EB] py-1.5 text-[12px] font-bold tabular-nums ${
                i === currentInning && isTop ? "bg-[#EFF6FF] text-[#1A1D23]" : "text-[#374151]"
              }`}>{away.scores[i - 1] !== null ? away.scores[i - 1] : ""}</td>
            ))}
            <td className="border-b border-r border-[#E5E7EB] py-1.5 text-[12px] font-black tabular-nums text-[#2563EB]">{away.runs}</td>
            <td className="border-b border-r border-[#E5E7EB] py-1.5 text-[12px] font-bold tabular-nums text-[#374151]">{away.hits}</td>
            <td className="border-b border-[#E5E7EB] py-1.5 text-[12px] font-bold tabular-nums text-[#374151]">{away.errors}</td>
          </tr>
          <tr>
            <td className="border-r border-[#E5E7EB] py-1.5">
              <div className="flex items-center justify-center gap-0.5">
                {!isTop && <span className="inline-block h-0 w-0 border-b-[5px] border-l-[4px] border-r-[4px] border-b-[#2563EB] border-l-transparent border-r-transparent" />}
                <span className="text-[10px] font-bold text-[#2563EB]">{home.shortName}</span>
              </div>
            </td>
            {innings.map((i) => (
              <td key={i} className={`border-r border-[#E5E7EB] py-1.5 text-[12px] font-bold tabular-nums ${
                i === currentInning && !isTop ? "bg-[#EFF6FF] text-[#1A1D23]" : "text-[#374151]"
              }`}>{home.scores[i - 1] !== null ? home.scores[i - 1] : ""}</td>
            ))}
            <td className="border-r border-[#E5E7EB] py-1.5 text-[12px] font-black tabular-nums text-[#2563EB]">{home.runs}</td>
            <td className="border-r border-[#E5E7EB] py-1.5 text-[12px] font-bold tabular-nums text-[#374151]">{home.hits}</td>
            <td className="py-1.5 text-[12px] font-bold tabular-nums text-[#374151]">{home.errors}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
