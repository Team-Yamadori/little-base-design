"use client";

import { useState } from "react";
import type { HitDirection } from "@/lib/game-state";

interface HitDirectionSelectionProps {
  actionLabel: string;
  showInfieldOption?: boolean;
  onSelect: (direction: HitDirection) => void;
  onCancel: () => void;
}

const infieldPositions: { dir: HitDirection; label: string }[] = [
  { dir: "投", label: "投" },
  { dir: "捕", label: "捕" },
  { dir: "一", label: "一" },
  { dir: "二", label: "二" },
  { dir: "三", label: "三" },
  { dir: "遊", label: "遊" },
];

export function HitDirectionSelection({ actionLabel, showInfieldOption = true, onSelect, onCancel }: HitDirectionSelectionProps) {
  const [showInfield, setShowInfield] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="w-full max-w-md animate-[slideUp_0.25s_ease-out] rounded-t-2xl border-t-2 border-[#2563EB] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <span className="text-sm font-black text-[#2563EB]">{actionLabel}</span>
          <span className="text-[10px] font-bold text-[#9CA3AF]">
            {showInfield ? "内野の守備位置を選択" : "打球方向を選択"}
          </span>
        </div>

        <div className="px-4 py-4">
          {showInfield ? (
            <div className="grid grid-cols-3 gap-2">
              {infieldPositions.map((p) => (
                <button
                  key={p.dir}
                  type="button"
                  onClick={() => onSelect(p.dir)}
                  className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#EFF6FF] py-3 transition-all active:scale-95"
                >
                  <span className="text-xl font-black text-[#2563EB]">{p.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onSelect("左")}
                  className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F0FDF4] py-3 transition-all active:scale-95"
                >
                  <span className="text-xl font-black text-[#16A34A]">左</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelect("中")}
                  className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F0FDF4] py-3 transition-all active:scale-95"
                >
                  <span className="text-xl font-black text-[#16A34A]">中</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelect("右")}
                  className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F0FDF4] py-3 transition-all active:scale-95"
                >
                  <span className="text-xl font-black text-[#16A34A]">右</span>
                </button>
              </div>
              {showInfieldOption && (
                <button
                  type="button"
                  onClick={() => setShowInfield(true)}
                  className="flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#EFF6FF] py-3 transition-all active:scale-95"
                >
                  <span className="text-xl font-black text-[#2563EB]">内野</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-[#E5E7EB] px-4 py-3">
          <button type="button" onClick={showInfield ? () => setShowInfield(false) : onCancel}
            className="w-full rounded-xl bg-[#F3F4F6] py-3 text-sm font-black text-[#6B7280] active:scale-95">
            {showInfield ? "戻る" : "キャンセル"}
          </button>
        </div>
      </div>
    </div>
  );
}
