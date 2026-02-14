"use client";

import type { HitDirection } from "@/lib/game-state";

interface HitDirectionSelectionProps {
  actionLabel: string;
  onSelect: (direction: HitDirection) => void;
  onCancel: () => void;
}

const directions: { dir: HitDirection; label: string; color: string; bg: string }[] = [
  { dir: "左", label: "左", color: "text-[#16A34A]", bg: "bg-[#F0FDF4]" },
  { dir: "中", label: "中", color: "text-[#16A34A]", bg: "bg-[#F0FDF4]" },
  { dir: "右", label: "右", color: "text-[#16A34A]", bg: "bg-[#F0FDF4]" },
  { dir: "三", label: "三", color: "text-[#2563EB]", bg: "bg-[#EFF6FF]" },
  { dir: "遊", label: "遊", color: "text-[#2563EB]", bg: "bg-[#EFF6FF]" },
  { dir: "二", label: "二", color: "text-[#2563EB]", bg: "bg-[#EFF6FF]" },
  { dir: "一", label: "一", color: "text-[#2563EB]", bg: "bg-[#EFF6FF]" },
  { dir: "投", label: "投", color: "text-[#D97706]", bg: "bg-[#FFFBEB]" },
  { dir: "捕", label: "捕", color: "text-[#D97706]", bg: "bg-[#FFFBEB]" },
];

export function HitDirectionSelection({ actionLabel, onSelect, onCancel }: HitDirectionSelectionProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="w-full max-w-md animate-[slideUp_0.25s_ease-out] rounded-t-2xl border-t-2 border-[#2563EB] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <span className="text-sm font-black text-[#2563EB]">{actionLabel}</span>
          <span className="text-[10px] font-bold text-[#9CA3AF]">打球方向を選択</span>
        </div>

        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            {directions.map((d) => (
              <button
                key={d.dir}
                type="button"
                onClick={() => onSelect(d.dir)}
                className={`flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] py-3 transition-all active:scale-95 ${d.bg}`}
              >
                <span className={`text-xl font-black ${d.color}`}>{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] px-4 py-3">
          <button type="button" onClick={onCancel}
            className="w-full rounded-xl bg-[#F3F4F6] py-3 text-sm font-black text-[#6B7280] active:scale-95">
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
