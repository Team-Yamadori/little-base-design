"use client";

import type { PlayerData } from "@/lib/game-state";

interface PlayerInfoProps {
  batter: PlayerData;
  pitcher: PlayerData;
}

export function PlayerInfo({ batter, pitcher }: PlayerInfoProps) {
  return (
    <div className="flex flex-col border-b border-[#E5E7EB]">
      <div className="flex items-center bg-white">
        <div className="flex w-10 items-center justify-center self-stretch bg-[#DC2626] py-2">
          <span className="text-[10px] font-black text-white">打</span>
        </div>
        <div className="flex flex-1 items-center justify-between px-3 py-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] font-bold tabular-nums text-[#2563EB]">#{batter.number}</span>
            <span className="text-sm font-black text-[#1A1D23]">{batter.name}</span>
            <span className="text-[10px] text-[#9CA3AF]">{batter.position}</span>
          </div>
          {batter.avg && (
            <span className="rounded bg-[#F0FDF4] px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-[#16A34A]">{batter.avg}</span>
          )}
        </div>
      </div>
      <div className="h-px bg-[#E5E7EB]" />
      <div className="flex items-center bg-white">
        <div className="flex w-10 items-center justify-center self-stretch bg-[#2563EB] py-2">
          <span className="text-[10px] font-black text-white">投</span>
        </div>
        <div className="flex flex-1 items-center justify-between px-3 py-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] font-bold tabular-nums text-[#2563EB]">#{pitcher.number}</span>
            <span className="text-sm font-black text-[#1A1D23]">{pitcher.name}</span>
          </div>
          {pitcher.era && (
            <span className="rounded bg-[#FEF3C7] px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-[#D97706]">ERA {pitcher.era}</span>
          )}
        </div>
      </div>
    </div>
  );
}
