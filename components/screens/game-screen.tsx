"use client";

import { useAppContext } from "@/lib/store";
import { useGame } from "@/hooks/use-game";
import { BaseDiamond } from "@/components/scoreboard/base-diamond";
import { CountDisplay } from "@/components/scoreboard/count-display";
import { GameControls } from "@/components/scoreboard/game-controls";
import { InningBoard } from "@/components/scoreboard/inning-board";
import { PlayerInfo } from "@/components/scoreboard/player-info";
import { RunnerResolution } from "@/components/scoreboard/runner-resolution";
import { HitDirectionSelection } from "@/components/scoreboard/hit-direction-selection";
import { FieldingNumberSelection } from "@/components/scoreboard/fielding-number-selection";
import { ArrowLeft, Clock, Undo2, X, UserRoundPlus, Footprints, Shield, GripVertical } from "lucide-react";
import { getPlayer, POSITION_SHORT, type Team } from "@/lib/team-data";
import { useState, useCallback, useEffect, useRef } from "react";

// ===== Timeout Menu (Power Pro style) =====
function TimeoutMenu({
  hasRunners,
  onSelect,
  onClose,
}: {
  hasRunners: boolean;
  onSelect: (action: "pinch-hit" | "pinch-run" | "defense-change") => void;
  onClose: () => void;
}) {
  const items = [
    { id: "pinch-hit" as const, label: "代打", sub: "PINCH HIT", icon: UserRoundPlus, color: "#DC2626", disabled: false },
    { id: "pinch-run" as const, label: "代走", sub: "PINCH RUN", icon: Footprints, color: "#16A34A", disabled: !hasRunners },
    { id: "defense-change" as const, label: "守備交代", sub: "DEFENSE", icon: Shield, color: "#2563EB", disabled: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="w-full max-w-md animate-[slideUp_0.2s_ease-out] rounded-t-2xl border-t border-[#E5E7EB] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#2563EB]" />
            <span className="text-sm font-black text-[#1A1D23]">タイム</span>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-[#9CA3AF] active:bg-[#F3F4F6]">
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => !item.disabled && onSelect(item.id)}
                disabled={item.disabled}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all ${
                  item.disabled
                    ? "border-[#E5E7EB] bg-[#F9FAFB] opacity-40"
                    : "border-[#E5E7EB] bg-white active:scale-[0.98] active:bg-[#F3F4F6]"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: item.disabled ? "#F3F4F6" : `${item.color}10` }}>
                  <Icon size={18} style={{ color: item.disabled ? "#D1D5DB" : item.color }} />
                </div>
                <div className="flex flex-col items-start">
                  <span className={`text-sm font-black ${item.disabled ? "text-[#D1D5DB]" : "text-[#1A1D23]"}`}>{item.label}</span>
                  <span className="text-[8px] font-bold tracking-wider text-[#9CA3AF]">{item.sub}</span>
                </div>
                {item.disabled && (
                  <span className="ml-auto text-[9px] font-bold text-[#D1D5DB]">ランナーなし</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="px-3 pb-3">
          <button type="button" onClick={onClose}
            className="w-full rounded-xl bg-[#F3F4F6] py-3 text-sm font-black text-[#6B7280] active:scale-95">
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Pinch Hit Panel =====
function PinchHitPanel({
  team,
  currentBatterIndex,
  onSubstitute,
  onClose,
}: {
  team: Team;
  currentBatterIndex: number;
  onSubstitute: (benchIndex: number) => void;
  onClose: () => void;
}) {
  const batter = team.lineup[currentBatterIndex];
  const batterPlayer = getPlayer(team, batter.playerId);
  const benchPlayers = team.benchPlayers.map((id) => getPlayer(team, id));

  const [selectedBench, setSelectedBench] = useState<number | null>(null);
  const longPressRef = useRef<NodeJS.Timeout | null>(null);
  const [dragging, setDragging] = useState<{ index: number; x: number; y: number } | null>(null);
  const [hoverBatter, setHoverBatter] = useState(false);

  const clearLP = useCallback(() => { if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; } }, []);
  const handlePointerDown = useCallback((e: React.PointerEvent, index: number) => {
    e.preventDefault();
    const x = e.clientX, y = e.clientY;
    longPressRef.current = setTimeout(() => { setDragging({ index, x, y }); }, 300);
  }, []);
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging) setDragging((d) => d ? { ...d, x: e.clientX, y: e.clientY } : null);
  }, [dragging]);
  const handlePointerUp = useCallback(() => {
    clearLP();
    if (dragging && hoverBatter) { onSubstitute(dragging.index); }
    setDragging(null);
    setHoverBatter(false);
  }, [dragging, hoverBatter, clearLP, onSubstitute]);
  useEffect(() => () => clearLP(), [clearLP]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <div className="flex max-h-[80vh] w-full max-w-md animate-[slideUp_0.25s_ease-out] flex-col rounded-t-2xl border-t-2 border-[#DC2626] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <UserRoundPlus size={14} className="text-[#DC2626]" />
            <span className="text-sm font-black text-[#DC2626]">代打</span>
          </div>
          <span className="text-[10px] font-bold text-[#9CA3AF]">
            {dragging ? "打者の上で離す" : "控えを長押しして打者へドラッグ"}
          </span>
        </div>

        <div className="border-b border-[#E5E7EB] px-3 py-3">
          <div className="mb-1 text-[9px] font-bold tracking-wider text-[#DC2626]">現在の打者</div>
          <div
            onPointerEnter={() => dragging && setHoverBatter(true)}
            onPointerLeave={() => setHoverBatter(false)}
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${
              hoverBatter
                ? "border-dashed border-[#DC2626] bg-red-50 scale-[1.02]"
                : "border-[#E5E7EB] bg-[#F9FAFB]"
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEE2E2] text-sm font-black text-[#DC2626]">
              {currentBatterIndex + 1}
            </span>
            <span className="flex-1 text-sm font-bold text-[#1A1D23]">{batterPlayer?.name ?? "-"}</span>
            <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
              {POSITION_SHORT[batter.fieldPosition]}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="mb-1 text-[9px] font-bold tracking-wider text-[#6B7280]">控え</div>
          <div className="flex flex-col gap-1">
            {benchPlayers.map((player, i) => {
              const isDragged = dragging?.index === i;
              const isSelected = selectedBench === i;
              return (
                <div
                  key={team.benchPlayers[i]}
                  onPointerDown={(e) => handlePointerDown(e, i)}
                  onClick={() => { if (!dragging) setSelectedBench(prev => prev === i ? null : i); }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all ${
                    isDragged ? "scale-95 opacity-40"
                    : isSelected ? "border-2 border-[#DC2626] bg-red-50"
                    : "border border-[#E5E7EB] bg-white"
                  }`}
                  style={{ touchAction: "none" }}
                >
                  <GripVertical size={14} className="text-[#D1D5DB]" />
                  <span className="flex-1 text-[11px] font-bold text-[#1A1D23]">{player?.name ?? "-"}</span>
                  <span className="text-[10px] font-bold text-[#2563EB]">
                    {player ? POSITION_SHORT[player.position] : "-"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {dragging && (
          <div className="pointer-events-none fixed z-[60] rounded-lg border-2 border-[#DC2626] bg-white px-3 py-2 shadow-xl opacity-90"
            style={{ left: dragging.x - 60, top: dragging.y - 20 }}>
            <span className="text-[11px] font-black text-[#1A1D23]">{benchPlayers[dragging.index]?.name}</span>
          </div>
        )}

        <div className="flex gap-3 border-t border-[#E5E7EB] px-4 py-3">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl bg-[#F3F4F6] py-3 text-sm font-black text-[#6B7280] active:scale-95">
            キャンセル
          </button>
          <button type="button"
            onClick={() => { if (selectedBench !== null) onSubstitute(selectedBench); }}
            disabled={selectedBench === null}
            className={`flex-[2] rounded-xl py-3 text-sm font-black active:scale-95 ${
              selectedBench !== null ? "bg-[#DC2626] text-white" : "bg-[#F3F4F6] text-[#D1D5DB]"
            }`}>
            代打を送る
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Pinch Run Panel =====
function PinchRunPanel({
  team,
  bases,
  onSubstitute,
  onClose,
}: {
  team: Team;
  bases: [boolean, boolean, boolean];
  onSubstitute: (lineupIndex: number, benchIndex: number) => void;
  onClose: () => void;
}) {
  const benchPlayers = team.benchPlayers.map((id) => getPlayer(team, id));
  const lineupPlayers = team.lineup.map((slot) => getPlayer(team, slot.playerId));
  const runnerBases = [
    bases[0] ? { baseLabel: "1塁ランナー", baseIndex: 0 } : null,
    bases[1] ? { baseLabel: "2塁ランナー", baseIndex: 1 } : null,
    bases[2] ? { baseLabel: "3塁ランナー", baseIndex: 2 } : null,
  ].filter(Boolean) as { baseLabel: string; baseIndex: number }[];

  const [selectedRunner, setSelectedRunner] = useState<number | null>(null);
  const [selectedBench, setSelectedBench] = useState<number | null>(null);
  const longPressRef = useRef<NodeJS.Timeout | null>(null);
  const [dragging, setDragging] = useState<{ source: "runner" | "bench"; index: number; x: number; y: number } | null>(null);
  const [hoverTarget, setHoverTarget] = useState<{ source: "runner" | "bench"; index: number } | null>(null);

  const clearLP = useCallback(() => { if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; } }, []);
  const handlePointerDown = useCallback((e: React.PointerEvent, source: "runner" | "bench", index: number) => {
    e.preventDefault();
    const x = e.clientX, y = e.clientY;
    longPressRef.current = setTimeout(() => { setDragging({ source, index, x, y }); }, 300);
  }, []);
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging) setDragging((d) => d ? { ...d, x: e.clientX, y: e.clientY } : null);
  }, [dragging]);
  const handlePointerUp = useCallback(() => {
    clearLP();
    if (dragging && hoverTarget) {
      if (dragging.source === "bench" && hoverTarget.source === "runner") {
        const runnerInfo = runnerBases[hoverTarget.index];
        if (runnerInfo) onSubstitute(runnerInfo.baseIndex, dragging.index);
      } else if (dragging.source === "runner" && hoverTarget.source === "bench") {
        const runnerInfo = runnerBases[dragging.index];
        if (runnerInfo) onSubstitute(runnerInfo.baseIndex, hoverTarget.index);
      }
    }
    setDragging(null);
    setHoverTarget(null);
  }, [dragging, hoverTarget, clearLP, onSubstitute, runnerBases]);
  useEffect(() => () => clearLP(), [clearLP]);
  const isDragging = dragging !== null;

  const doConfirm = () => {
    if (selectedRunner !== null && selectedBench !== null) {
      const runnerInfo = runnerBases[selectedRunner];
      if (runnerInfo) onSubstitute(runnerInfo.baseIndex, selectedBench);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <div className="flex max-h-[80vh] w-full max-w-md animate-[slideUp_0.25s_ease-out] flex-col rounded-t-2xl border-t-2 border-[#16A34A] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Footprints size={14} className="text-[#16A34A]" />
            <span className="text-sm font-black text-[#16A34A]">代走</span>
          </div>
          <span className="text-[10px] font-bold text-[#9CA3AF]">
            {isDragging ? "交代先で離す" : "長押しでドラッグ / タップで選択"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-[#E5E7EB] px-3 py-2">
            <div className="mb-1 text-[9px] font-bold tracking-wider text-[#16A34A]">塁上のランナー</div>
            <div className="flex flex-col gap-1">
              {runnerBases.map((rb, i) => {
                const isDragged = dragging?.source === "runner" && dragging.index === i;
                const isHovered = hoverTarget?.source === "runner" && hoverTarget.index === i;
                const isSelected = selectedRunner === i;
                const lineupIdx = Math.min(rb.baseIndex, team.lineup.length - 1);
                const player = lineupPlayers[lineupIdx];
                return (
                  <div
                    key={rb.baseIndex}
                    onPointerDown={(e) => handlePointerDown(e, "runner", i)}
                    onPointerEnter={() => isDragging && setHoverTarget({ source: "runner", index: i })}
                    onClick={() => { if (!isDragging) setSelectedRunner(prev => prev === i ? null : i); }}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${
                      isDragged ? "scale-95 opacity-40"
                      : isHovered ? "border-dashed border-[#16A34A] bg-green-50"
                      : isSelected ? "border-[#16A34A] bg-green-50"
                      : "border-[#E5E7EB] bg-[#F9FAFB]"
                    }`}
                    style={{ touchAction: "none" }}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DCFCE7] text-[10px] font-black text-[#16A34A]">
                      {rb.baseIndex + 1}塁
                    </span>
                    <span className="flex-1 text-[11px] font-bold text-[#1A1D23]">{player?.name ?? "-"}</span>
                    <GripVertical size={14} className="text-[#D1D5DB]" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="mb-1 text-[9px] font-bold tracking-wider text-[#6B7280]">控え</div>
            <div className="flex flex-col gap-1">
              {benchPlayers.map((player, i) => {
                const isDragged = dragging?.source === "bench" && dragging.index === i;
                const isHovered = hoverTarget?.source === "bench" && hoverTarget.index === i;
                const isSelected = selectedBench === i;
                return (
                  <div
                    key={team.benchPlayers[i]}
                    onPointerDown={(e) => handlePointerDown(e, "bench", i)}
                    onPointerEnter={() => isDragging && setHoverTarget({ source: "bench", index: i })}
                    onClick={() => { if (!isDragging) setSelectedBench(prev => prev === i ? null : i); }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all ${
                      isDragged ? "scale-95 opacity-40"
                      : isHovered ? "border-2 border-dashed border-[#16A34A] bg-green-50"
                      : isSelected ? "border-2 border-[#16A34A] bg-green-50"
                      : "border border-[#E5E7EB] bg-white"
                    }`}
                    style={{ touchAction: "none" }}
                  >
                    <GripVertical size={14} className="text-[#D1D5DB]" />
                    <span className="flex-1 text-[11px] font-bold text-[#1A1D23]">{player?.name ?? "-"}</span>
                    <span className="text-[10px] font-bold text-[#2563EB]">
                      {player ? POSITION_SHORT[player.position] : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {dragging && (
          <div className="pointer-events-none fixed z-[60] rounded-lg border-2 border-[#16A34A] bg-white px-3 py-2 shadow-xl opacity-90"
            style={{ left: dragging.x - 60, top: dragging.y - 20 }}>
            <span className="text-[11px] font-black text-[#1A1D23]">
              {dragging.source === "runner"
                ? lineupPlayers[Math.min(runnerBases[dragging.index]?.baseIndex ?? 0, team.lineup.length - 1)]?.name
                : benchPlayers[dragging.index]?.name}
            </span>
          </div>
        )}

        <div className="flex gap-3 border-t border-[#E5E7EB] px-4 py-3">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl bg-[#F3F4F6] py-3 text-sm font-black text-[#6B7280] active:scale-95">
            キャンセル
          </button>
          <button type="button" onClick={doConfirm}
            disabled={selectedRunner === null || selectedBench === null}
            className={`flex-[2] rounded-xl py-3 text-sm font-black active:scale-95 ${
              selectedRunner !== null && selectedBench !== null
                ? "bg-[#16A34A] text-white" : "bg-[#F3F4F6] text-[#D1D5DB]"
            }`}>
            代走を送る
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Defense Change Panel =====
function DefenseChangePanel({
  team,
  onSubstitute,
  onClose,
}: {
  team: Team;
  onSubstitute: (lineupIndex: number, benchIndex: number) => void;
  onClose: () => void;
}) {
  const lineupPlayers = team.lineup.map((slot) => getPlayer(team, slot.playerId));
  const benchPlayers = team.benchPlayers.map((id) => getPlayer(team, id));
  const longPressRef = useRef<NodeJS.Timeout | null>(null);
  const [dragging, setDragging] = useState<{ source: "lineup" | "bench"; index: number; x: number; y: number } | null>(null);
  const [hoverTarget, setHoverTarget] = useState<{ source: "lineup" | "bench"; index: number } | null>(null);

  const clearLP = useCallback(() => { if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; } }, []);
  const handlePointerDown = useCallback((e: React.PointerEvent, source: "lineup" | "bench", index: number) => {
    e.preventDefault();
    const x = e.clientX, y = e.clientY;
    longPressRef.current = setTimeout(() => { setDragging({ source, index, x, y }); }, 300);
  }, []);
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging) setDragging((d) => d ? { ...d, x: e.clientX, y: e.clientY } : null);
  }, [dragging]);
  const handlePointerUp = useCallback(() => {
    clearLP();
    if (dragging && hoverTarget && dragging.source !== hoverTarget.source) {
      const lineupIdx = dragging.source === "lineup" ? dragging.index : hoverTarget.index;
      const benchIdx = dragging.source === "bench" ? dragging.index : hoverTarget.index;
      onSubstitute(lineupIdx, benchIdx);
    }
    setDragging(null);
    setHoverTarget(null);
  }, [dragging, hoverTarget, clearLP, onSubstitute]);
  useEffect(() => () => clearLP(), [clearLP]);
  const isDragging = dragging !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <div className="flex max-h-[85vh] w-full max-w-md animate-[slideUp_0.25s_ease-out] flex-col rounded-t-2xl border-t-2 border-[#2563EB] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[#2563EB]" />
            <span className="text-sm font-black text-[#2563EB]">守備交代</span>
          </div>
          <span className="text-[10px] font-bold text-[#9CA3AF]">
            {isDragging ? "交代先で離す" : "長押しでドラッグ交代"}
          </span>
        </div>

        <div className="flex flex-1 gap-2 overflow-hidden px-2 py-2">
          {/* Starters */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="mb-1 flex items-center gap-1 px-1">
              <div className="h-px flex-1 bg-[#E5E7EB]" />
              <span className="text-[8px] font-black tracking-wider text-[#2563EB]">出場中</span>
              <div className="h-px flex-1 bg-[#E5E7EB]" />
            </div>
            <div className="flex flex-col gap-1">
              {lineupPlayers.map((player, i) => {
                const isDragged = dragging?.source === "lineup" && dragging.index === i;
                const isHovered = hoverTarget?.source === "lineup" && hoverTarget.index === i && !isDragged;
                return (
                  <div
                    key={team.lineup[i].playerId}
                    onPointerDown={(e) => handlePointerDown(e, "lineup", i)}
                    onPointerEnter={() => isDragging && setHoverTarget({ source: "lineup", index: i })}
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-2 transition-all ${
                      isDragged ? "scale-95 opacity-40"
                      : isHovered ? "border-2 border-dashed border-[#2563EB] bg-blue-50"
                      : "border border-[#E5E7EB] bg-white"
                    }`}
                    style={{ touchAction: "none" }}
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#EFF6FF]">
                      <span className="text-[9px] font-black text-[#2563EB]">{i + 1}</span>
                    </div>
                    <span className="flex-1 truncate text-[11px] font-bold text-[#1A1D23]">{player?.name ?? "-"}</span>
                    <span className="rounded bg-[#EFF6FF] px-1.5 py-0.5 text-[9px] font-black text-[#2563EB]">
                      {POSITION_SHORT[team.lineup[i].fieldPosition]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bench */}
          <div className="flex w-[110px] shrink-0 flex-col overflow-y-auto">
            <div className="mb-1 flex items-center gap-1 px-1">
              <div className="h-px flex-1 bg-[#E5E7EB]" />
              <span className="text-[8px] font-black tracking-wider text-[#9CA3AF]">控え</span>
              <div className="h-px flex-1 bg-[#E5E7EB]" />
            </div>
            <div className="flex flex-col gap-1">
              {benchPlayers.map((player, i) => {
                const isDragged = dragging?.source === "bench" && dragging.index === i;
                const isHovered = hoverTarget?.source === "bench" && hoverTarget.index === i && !isDragged;
                return (
                  <div
                    key={team.benchPlayers[i]}
                    onPointerDown={(e) => handlePointerDown(e, "bench", i)}
                    onPointerEnter={() => isDragging && setHoverTarget({ source: "bench", index: i })}
                    className={`flex items-center gap-1 rounded-lg px-1.5 py-2 transition-all ${
                      isDragged ? "scale-95 opacity-40"
                      : isHovered ? "border-2 border-dashed border-[#2563EB] bg-blue-50"
                      : "border border-[#E5E7EB] bg-white"
                    }`}
                    style={{ touchAction: "none" }}
                  >
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate text-[10px] font-black text-[#1A1D23]">{player?.name ?? "-"}</span>
                      <span className="text-[8px] text-[#9CA3AF]">#{player?.number}</span>
                    </div>
                    <span className="rounded bg-[#EFF6FF] px-1 py-0.5 text-[9px] font-black text-[#2563EB]">
                      {player ? POSITION_SHORT[player.position] : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {dragging && (
          <div className="pointer-events-none fixed z-[60] rounded-lg border-2 border-[#2563EB] bg-white px-3 py-2 shadow-xl opacity-90"
            style={{ left: dragging.x - 60, top: dragging.y - 20 }}>
            <span className="text-[11px] font-black text-[#1A1D23]">
              {dragging.source === "lineup"
                ? lineupPlayers[dragging.index]?.name
                : benchPlayers[dragging.index]?.name}
            </span>
          </div>
        )}

        <div className="border-t border-[#E5E7EB] px-4 py-3">
          <button type="button" onClick={onClose}
            className="w-full rounded-xl bg-[#F3F4F6] py-3 text-sm font-black text-[#6B7280] active:scale-95">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Main Game Screen =====
export function GameScreen() {
  const { state, navigate, updateMyTeam, addGameRecord, setActiveGameState } = useAppContext();
  const {
    gameState, message, playSeq, pendingPlay, strikeoutPending,
    pendingDirection, pendingFielding, undoConfirmPending, lastHistoryLabel,
    handleAction, updatePendingSlot, cancelPending, confirmPending,
    resolveStrikeout, resolveDirection, cancelDirection,
    updateFieldingNumbers, confirmFielding, cancelFielding,
    requestUndo, confirmUndo, cancelUndo,
  } = useGame();

  const [timeoutMenu, setTimeoutMenu] = useState(false);
  const [pinchHitMode, setPinchHitMode] = useState(false);
  const [pinchRunMode, setPinchRunMode] = useState(false);
  const [defenseMode, setDefenseMode] = useState(false);

  useEffect(() => { setActiveGameState(gameState); }, [gameState, setActiveGameState]);

  const hasRunners = gameState.bases[0] || gameState.bases[1] || gameState.bases[2];
  const handleTimeoutSelect = useCallback((action: "pinch-hit" | "pinch-run" | "defense-change") => {
    setTimeoutMenu(false);
    if (action === "pinch-hit") setPinchHitMode(true);
    else if (action === "pinch-run") setPinchRunMode(true);
    else if (action === "defense-change") setDefenseMode(true);
  }, []);

  const currentBatterIndex = 0;

  const handlePinchHit = useCallback((benchIndex: number) => {
    updateMyTeam((t) => {
      const newLineup = [...t.lineup]; const newBench = [...t.benchPlayers];
      const oldSlot = newLineup[currentBatterIndex]; const benchId = newBench[benchIndex];
      newLineup[currentBatterIndex] = { playerId: benchId, fieldPosition: oldSlot.fieldPosition };
      newBench[benchIndex] = oldSlot.playerId;
      return { ...t, lineup: newLineup, benchPlayers: newBench };
    });
    setPinchHitMode(false);
  }, [updateMyTeam, currentBatterIndex]);

  const handlePinchRun = useCallback((lineupIndex: number, benchIndex: number) => {
    updateMyTeam((t) => {
      const newLineup = [...t.lineup]; const newBench = [...t.benchPlayers];
      const oldSlot = newLineup[lineupIndex]; const benchId = newBench[benchIndex];
      newLineup[lineupIndex] = { playerId: benchId, fieldPosition: oldSlot.fieldPosition };
      newBench[benchIndex] = oldSlot.playerId;
      return { ...t, lineup: newLineup, benchPlayers: newBench };
    });
    setPinchRunMode(false);
  }, [updateMyTeam]);

  const handleDefenseSubstitute = useCallback((lineupIndex: number, benchIndex: number) => {
    updateMyTeam((t) => {
      const newLineup = [...t.lineup]; const newBench = [...t.benchPlayers];
      const oldSlot = newLineup[lineupIndex]; const benchId = newBench[benchIndex];
      newLineup[lineupIndex] = { playerId: benchId, fieldPosition: oldSlot.fieldPosition };
      newBench[benchIndex] = oldSlot.playerId;
      return { ...t, lineup: newLineup, benchPlayers: newBench };
    });
    setDefenseMode(false);
  }, [updateMyTeam]);

  const handleGameEnd = useCallback(() => {
    const record = {
      id: `game-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      homeTeam: state.myTeam.name, awayTeam: state.opponent.name,
      homeShort: state.myTeam.shortName, awayShort: state.opponent.shortName,
      homeColor: state.myTeam.color, awayColor: state.opponent.color,
      homeScore: gameState.home.runs, awayScore: gameState.away.runs,
      innings: { away: gameState.away.scores, home: gameState.home.scores },
      homeHits: gameState.home.hits, awayHits: gameState.away.hits,
      homeErrors: gameState.home.errors, awayErrors: gameState.away.errors,
      homeLineup: state.myTeam.lineup.map((slot) => {
        const p = getPlayer(state.myTeam, slot.playerId);
        return { name: p?.name ?? "-", pos: POSITION_SHORT[slot.fieldPosition], atBats: Math.floor(Math.random() * 3 + 2), hits: Math.floor(Math.random() * 3), rbi: Math.floor(Math.random() * 2), avg: p?.avg ?? 0 };
      }),
      awayLineup: state.opponent.lineup.map((slot) => {
        const p = getPlayer(state.opponent, slot.playerId);
        return { name: p?.name ?? "-", pos: POSITION_SHORT[slot.fieldPosition], atBats: Math.floor(Math.random() * 3 + 2), hits: Math.floor(Math.random() * 3), rbi: Math.floor(Math.random() * 2), avg: p?.avg ?? 0 };
      }),
      homePitchers: [{ name: getPlayer(state.myTeam, state.myTeam.lineup[8]?.playerId)?.name ?? "-", ip: 9, hits: gameState.away.hits, er: gameState.away.runs, so: Math.floor(Math.random() * 8 + 2), bb: Math.floor(Math.random() * 4), result: gameState.home.runs > gameState.away.runs ? "W" : "L" }],
      awayPitchers: [{ name: getPlayer(state.opponent, state.opponent.lineup[8]?.playerId)?.name ?? "-", ip: 9, hits: gameState.home.hits, er: gameState.home.runs, so: Math.floor(Math.random() * 8 + 2), bb: Math.floor(Math.random() * 4), result: gameState.away.runs > gameState.home.runs ? "W" : "L" }],
    };
    addGameRecord(record);
    setActiveGameState(null);
    navigate("score-history");
  }, [state, gameState, addGameRecord, navigate, setActiveGameState]);

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#F8F9FB]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-3 py-2">
        <button type="button" onClick={() => navigate("home")}
          className="flex items-center gap-1 text-[#6B7280] active:opacity-70">
          <ArrowLeft size={16} />
          <span className="text-[10px] font-bold">メニュー</span>
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={requestUndo} disabled={!lastHistoryLabel}
            className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-black active:bg-[#E5E7EB] ${
              lastHistoryLabel ? "border-[#6B7280] bg-[#F3F4F6] text-[#6B7280]" : "border-[#E5E7EB] bg-[#F9FAFB] text-[#D1D5DB]"
            }`}>
            <Undo2 size={13} />
            戻る
          </button>
          <button type="button" onClick={() => setTimeoutMenu(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#2563EB] bg-[#EFF6FF] px-3 py-1.5 text-[10px] font-black text-[#2563EB] active:bg-[#DBEAFE]">
            <Clock size={13} />
            タイム
          </button>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col">
        {/* Score HUD */}
        <div className="flex items-stretch border-b border-[#E5E7EB] bg-white">
          <div className="flex items-center gap-1 border-r border-[#E5E7EB] px-3 py-2">
            <div className="flex flex-col items-center leading-none">
              <svg width="10" height="6" viewBox="0 0 10 6" className={gameState.isTop ? "opacity-100" : "opacity-20"} aria-hidden="true">
                <polygon points="5,0 10,6 0,6" fill={gameState.isTop ? "#2563EB" : "#D1D5DB"} />
              </svg>
              <svg width="10" height="6" viewBox="0 0 10 6" className={`mt-0.5 ${!gameState.isTop ? "opacity-100" : "opacity-20"}`} aria-hidden="true">
                <polygon points="5,6 10,0 0,0" fill={!gameState.isTop ? "#2563EB" : "#D1D5DB"} />
              </svg>
            </div>
            <span className="text-xl font-black text-[#2563EB]">{gameState.inning}</span>
          </div>
          <div className="flex flex-1 items-center justify-center gap-4 px-3">
            <div className="flex items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${gameState.isTop ? "bg-[#DC2626]" : "bg-[#DC2626]/50"}`}>
                {gameState.away.shortName}
              </span>
              <span className="text-2xl font-black tabular-nums text-[#1A1D23]">{gameState.away.runs}</span>
            </div>
            <span className="text-sm font-bold text-[#D1D5DB]">-</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tabular-nums text-[#1A1D23]">{gameState.home.runs}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${!gameState.isTop ? "bg-[#2563EB]" : "bg-[#2563EB]/50"}`}>
                {gameState.home.shortName}
              </span>
            </div>
          </div>
          <div className="flex items-center border-l border-[#E5E7EB] px-3">
            <BaseDiamond bases={gameState.bases} size="sm" />
          </div>
        </div>

        <CountDisplay balls={gameState.balls} strikes={gameState.strikes} outs={gameState.outs} />
        <PlayerInfo batter={gameState.currentBatter} pitcher={gameState.currentPitcher} />
        <InningBoard home={gameState.home} away={gameState.away} currentInning={gameState.inning} isTop={gameState.isTop} />

        <div className="flex items-center justify-center bg-[#F3F4F6] py-4">
          <BaseDiamond bases={gameState.bases} size="lg" />
        </div>

        <GameControls key={playSeq} gameState={gameState} onAction={handleAction} />
      </div>

      {pendingDirection && (
        <HitDirectionSelection
          actionLabel={pendingDirection.label}
          onSelect={resolveDirection}
          onCancel={cancelDirection}
        />
      )}
      {pendingFielding && (
        <FieldingNumberSelection
          actionLabel={pendingFielding.actionLabel}
          numbers={pendingFielding.numbers}
          onUpdate={updateFieldingNumbers}
          onConfirm={confirmFielding}
          onCancel={cancelFielding}
        />
      )}
      {pendingPlay && <RunnerResolution play={pendingPlay} onUpdate={updatePendingSlot} onCancel={cancelPending} onConfirm={confirmPending} />}
      {strikeoutPending && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
          <div className="w-full max-w-md animate-[slideUp_0.25s_ease-out] rounded-t-2xl border-t-2 border-[#DC2626] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
              <span className="text-sm font-black text-[#DC2626]">三振</span>
              <span className="text-[10px] font-bold text-[#9CA3AF]">種類を選択</span>
            </div>
            <div className="flex gap-3 px-4 py-4">
              <button type="button" onClick={() => resolveStrikeout("swinging")}
                className="flex flex-1 flex-col items-center rounded-xl border border-[#E5E7EB] bg-[#FEF2F2] py-4 active:scale-95">
                <span className="text-lg font-black text-[#DC2626]">空振り</span>
                <span className="mt-1 text-[10px] font-bold text-[#9CA3AF]">三振</span>
              </button>
              <button type="button" onClick={() => resolveStrikeout("looking")}
                className="flex flex-1 flex-col items-center rounded-xl border border-[#E5E7EB] bg-[#FFFBEB] py-4 active:scale-95">
                <span className="text-lg font-black text-[#D97706]">見逃し</span>
                <span className="mt-1 text-[10px] font-bold text-[#9CA3AF]">三振</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {timeoutMenu && <TimeoutMenu hasRunners={hasRunners} onSelect={handleTimeoutSelect} onClose={() => setTimeoutMenu(false)} />}
      {pinchHitMode && <PinchHitPanel team={state.myTeam} currentBatterIndex={currentBatterIndex} onSubstitute={handlePinchHit} onClose={() => setPinchHitMode(false)} />}
      {pinchRunMode && <PinchRunPanel team={state.myTeam} bases={gameState.bases} onSubstitute={handlePinchRun} onClose={() => setPinchRunMode(false)} />}
      {defenseMode && <DefenseChangePanel team={state.myTeam} onSubstitute={handleDefenseSubstitute} onClose={() => setDefenseMode(false)} />}

      {message && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="animate-bounce rounded-2xl border-2 border-[#2563EB] bg-white px-8 py-4 shadow-xl">
            <span className="text-2xl font-black text-[#2563EB]">{message}</span>
          </div>
        </div>
      )}

      {undoConfirmPending && lastHistoryLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[300px] animate-[slideUp_0.2s_ease-out] rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-center text-sm font-bold text-[#1A1D23]">
              <span className="font-black text-[#DC2626]">{lastHistoryLabel}</span>
              <span className="mt-1 block text-[#6B7280]">の操作が消えます。よろしいですか？</span>
            </p>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={cancelUndo}
                className="flex-1 rounded-xl bg-[#F3F4F6] py-3 text-sm font-black text-[#6B7280] active:scale-95">
                いいえ
              </button>
              <button type="button" onClick={confirmUndo}
                className="flex-1 rounded-xl bg-[#DC2626] py-3 text-sm font-black text-white active:scale-95">
                はい
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState.isGameOver && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="pointer-events-auto flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-xl">
            <span className="text-3xl font-black text-[#1A1D23]">GAME SET</span>
            <div className="flex items-center gap-4 text-xl font-black text-[#1A1D23]">
              <span>{gameState.away.shortName} {gameState.away.runs}</span>
              <span className="text-[#D1D5DB]">-</span>
              <span>{gameState.home.runs} {gameState.home.shortName}</span>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { handleAction("reset"); setActiveGameState(null); }}
                className="rounded-xl bg-[#F3F4F6] px-6 py-3 text-sm font-black text-[#6B7280] active:scale-95">
                もう一度
              </button>
              <button type="button" onClick={handleGameEnd}
                className="rounded-xl bg-[#2563EB] px-8 py-3 text-sm font-black text-white active:scale-95">
                結果を保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
