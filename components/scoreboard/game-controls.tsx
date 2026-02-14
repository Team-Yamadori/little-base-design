"use client";

import { useState } from "react";
import type { GameAction, GameState } from "@/lib/game-state";

interface GameControlsProps {
  gameState: GameState;
  onAction: (action: GameAction) => void;
}

interface ActionButton {
  action: GameAction;
  label: string;
  sub?: string;
  color: string;
  bgColor: string;
  activeBg: string;
  disabled?: (state: GameState) => boolean;
  accent?: boolean;
}

const tabs = [
  { id: "count", label: "投球" },
  { id: "hit", label: "安打" },
  { id: "out", label: "アウト" },
  { id: "run", label: "走塁" },
  { id: "other", label: "その他" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const tabActions: Record<TabId, ActionButton[]> = {
  count: [
    { action: "ball", label: "B", sub: "ボール", color: "text-[#16A34A]", bgColor: "bg-[#F0FDF4]", activeBg: "active:bg-[#DCFCE7]" },
    { action: "strike", label: "S", sub: "ストライク", color: "text-[#F59E0B]", bgColor: "bg-[#FFFBEB]", activeBg: "active:bg-[#FEF3C7]" },
    { action: "foul", label: "F", sub: "ファウル", color: "text-[#8B5CF6]", bgColor: "bg-[#F5F3FF]", activeBg: "active:bg-[#EDE9FE]" },
  ],
  hit: [
    { action: "single", label: "1B", sub: "シングル", color: "text-[#2563EB]", bgColor: "bg-[#EFF6FF]", activeBg: "active:bg-[#DBEAFE]" },
    { action: "double", label: "2B", sub: "二塁打", color: "text-[#0891B2]", bgColor: "bg-[#ECFEFF]", activeBg: "active:bg-[#CFFAFE]" },
    { action: "triple", label: "3B", sub: "三塁打", color: "text-[#D97706]", bgColor: "bg-[#FFFBEB]", activeBg: "active:bg-[#FEF3C7]" },
    { action: "homerun", label: "HR", sub: "ホームラン", color: "text-[#DC2626]", bgColor: "bg-[#FEF2F2]", activeBg: "active:bg-[#FEE2E2]", accent: true },
  ],
  out: [
    { action: "groundout", label: "GO", sub: "ゴロ", color: "text-[#DC2626]", bgColor: "bg-[#FEF2F2]", activeBg: "active:bg-[#FEE2E2]" },
    { action: "flyout", label: "FO", sub: "フライ", color: "text-[#2563EB]", bgColor: "bg-[#EFF6FF]", activeBg: "active:bg-[#DBEAFE]" },
    { action: "lineout", label: "LO", sub: "ライナー", color: "text-[#D97706]", bgColor: "bg-[#FFFBEB]", activeBg: "active:bg-[#FEF3C7]" },
    { action: "sacrifice-fly", label: "SF", sub: "犠飛", color: "text-[#0891B2]", bgColor: "bg-[#ECFEFF]", activeBg: "active:bg-[#CFFAFE]", disabled: (s) => !s.bases[2] },
    { action: "sacrifice-bunt", label: "SH", sub: "犠打", color: "text-[#16A34A]", bgColor: "bg-[#F0FDF4]", activeBg: "active:bg-[#DCFCE7]", disabled: (s) => !s.bases[0] && !s.bases[1] && !s.bases[2] },
  ],
  run: [
    { action: "stolen-base", label: "SB", sub: "盗塁成功", color: "text-[#16A34A]", bgColor: "bg-[#F0FDF4]", activeBg: "active:bg-[#DCFCE7]", disabled: (s) => !s.bases[0] && !s.bases[1] && !s.bases[2] },
    { action: "caught-stealing", label: "CS", sub: "盗塁失敗", color: "text-[#DC2626]", bgColor: "bg-[#FEF2F2]", activeBg: "active:bg-[#FEE2E2]", disabled: (s) => !s.bases[0] && !s.bases[1] && !s.bases[2] },
    { action: "wild-pitch", label: "WP", sub: "暴投", color: "text-[#D97706]", bgColor: "bg-[#FFFBEB]", activeBg: "active:bg-[#FEF3C7]", disabled: (s) => !s.bases[0] && !s.bases[1] && !s.bases[2] },
    { action: "passed-ball", label: "PB", sub: "捕逸", color: "text-[#D97706]", bgColor: "bg-[#FFFBEB]", activeBg: "active:bg-[#FEF3C7]", disabled: (s) => !s.bases[0] && !s.bases[1] && !s.bases[2] },
    { action: "balk", label: "BK", sub: "ボーク", color: "text-[#D97706]", bgColor: "bg-[#FFFBEB]", activeBg: "active:bg-[#FEF3C7]", disabled: (s) => !s.bases[0] && !s.bases[1] && !s.bases[2] },
    { action: "runner-out", label: "RO", sub: "走塁アウト", color: "text-[#DC2626]", bgColor: "bg-[#FEF2F2]", activeBg: "active:bg-[#FEE2E2]", disabled: (s) => !s.bases[0] && !s.bases[1] && !s.bases[2] },
  ],
  other: [
    { action: "hit-by-pitch", label: "HBP", sub: "死球", color: "text-[#DC2626]", bgColor: "bg-[#FEF2F2]", activeBg: "active:bg-[#FEE2E2]" },
    { action: "dropped-third-strike", label: "振逃", sub: "振り逃げ", color: "text-[#8B5CF6]", bgColor: "bg-[#F5F3FF]", activeBg: "active:bg-[#EDE9FE]" },
    { action: "fielders-choice", label: "FC", sub: "野選", color: "text-[#D97706]", bgColor: "bg-[#FFFBEB]", activeBg: "active:bg-[#FEF3C7]", disabled: (s) => !s.bases[0] && !s.bases[1] && !s.bases[2] },
    { action: "error", label: "E", sub: "エラー", color: "text-[#D97706]", bgColor: "bg-[#FFFBEB]", activeBg: "active:bg-[#FEF3C7]" },
    { action: "catcher-interference", label: "CI", sub: "打撃妨害", color: "text-[#6B7280]", bgColor: "bg-[#F3F4F6]", activeBg: "active:bg-[#E5E7EB]" },
    { action: "obstruction", label: "OB", sub: "走塁妨害", color: "text-[#6B7280]", bgColor: "bg-[#F3F4F6]", activeBg: "active:bg-[#E5E7EB]", disabled: (s) => !s.bases[0] && !s.bases[1] && !s.bases[2] },
    { action: "offensive-interference", label: "OI", sub: "守備妨害", color: "text-[#6B7280]", bgColor: "bg-[#F3F4F6]", activeBg: "active:bg-[#E5E7EB]", disabled: (s) => !s.bases[0] && !s.bases[1] && !s.bases[2] },
  ],
};

export function GameControls({ gameState, onAction }: GameControlsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("count");
  const actions = tabActions[activeTab];

  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="flex border-b border-[#E5E7EB]">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-center text-[11px] font-black transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-[#2563EB] text-[#2563EB]"
                : "text-[#9CA3AF]"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 px-3 py-3">
        <div className={`grid gap-2 ${
          actions.length <= 3 ? "grid-cols-3" : actions.length <= 4 ? "grid-cols-4" : "grid-cols-3"
        }`}>
          {actions.map((btn) => {
            const isDisabled = btn.disabled?.(gameState);
            return (
              <button key={btn.action} type="button" onClick={() => onAction(btn.action)} disabled={isDisabled}
                className={`flex flex-col items-center justify-center rounded-xl py-4 transition-all active:scale-95 ${btn.bgColor} ${btn.activeBg} ${
                  btn.accent ? "border-2 border-[#DC2626]" : "border border-[#E5E7EB]"
                } ${isDisabled ? "opacity-30" : ""}`}>
                <span className={`text-lg font-black ${btn.color}`}>{btn.label}</span>
                {btn.sub && <span className="mt-0.5 text-[9px] font-bold text-[#9CA3AF]">{btn.sub}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
