"use client";

import { useAppContext } from "@/lib/store";
import { useGame } from "@/hooks/use-game";
import { BaseDiamond } from "@/components/scoreboard/base-diamond";
import { CountDisplay } from "@/components/scoreboard/count-display";
import { GameControls } from "@/components/scoreboard/game-controls";
import { InningBoard } from "@/components/scoreboard/inning-board";
import { PlayerInfo } from "@/components/scoreboard/player-info";
import { RunnerResolution } from "@/components/scoreboard/runner-resolution";
import { ArrowLeft, Clock, X, UserRoundPlus, Footprints, Shield, GripVertical } from "lucide-react";
import { getPlayer, POSITION_SHORT, type Team } from "@/lib/team-data";
import { useState, useCallback, useEffect, useRef } from "react";

// ===== Timeout Menu (Power Pro style) - 3 items only =====
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
    { id: "pinch-hit" as const, label: "代打", sub: "PINCH HIT", icon: UserRoundPlus, color: "hsl(0,85%,55%)", disabled: false },
    { id: "pinch-run" as const, label: "代走", sub: "PINCH RUN", icon: Footprints, color: "hsl(120,60%,45%)", disabled: !hasRunners },
    { id: "defense-change" as const, label: "守備交代", sub: "DEFENSE", icon: Shield, color: "hsl(210,80%,55%)", disabled: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(210,80%,4%)]/80">
      <div className="w-full max-w-md animate-[slideUp_0.2s_ease-out] rounded-t-2xl border-t-2 border-[hsl(38,100%,40%)] bg-[hsl(210,50%,8%)]">
        <div className="flex items-center justify-between border-b border-[hsl(210,40%,18%)] px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[hsl(38,100%,50%)]" />
            <span className="text-sm font-black text-[hsl(38,100%,55%)]">タイム</span>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-[hsl(210,20%,50%)] active:bg-[hsl(210,30%,15%)]">
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
                    ? "border-[hsl(210,20%,15%)] bg-[hsl(210,30%,7%)] opacity-40"
                    : "border-[hsl(210,30%,18%)] bg-[hsl(210,45%,9%)] active:scale-[0.98] active:bg-[hsl(210,45%,12%)]"
                }`}
              >
                <Icon size={20} style={{ color: item.disabled ? "hsl(210,15%,30%)" : item.color }} />
                <div className="flex flex-col items-start">
                  <span className={`text-sm font-black ${item.disabled ? "text-[hsl(210,15%,30%)]" : "text-[hsl(48,100%,96%)]"}`}>{item.label}</span>
                  <span className="text-[8px] font-bold tracking-wider text-[hsl(210,20%,40%)]">{item.sub}</span>
                </div>
                {item.disabled && (
                  <span className="ml-auto text-[9px] font-bold text-[hsl(210,15%,30%)]">ランナーなし</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[hsl(210,30%,15%)] py-3 text-sm font-black text-[hsl(210,20%,55%)] active:scale-95"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Pinch Hit Panel: current batter + bench (drag to swap) =====
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(210,80%,4%)]/80"
      onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <div className="flex max-h-[80vh] w-full max-w-md animate-[slideUp_0.25s_ease-out] flex-col rounded-t-2xl border-t-2 border-[hsl(0,85%,55%)] bg-[hsl(210,50%,8%)]">
        <div className="flex items-center justify-between border-b border-[hsl(210,40%,18%)] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <UserRoundPlus size={14} className="text-[hsl(0,85%,55%)]" />
            <span className="text-sm font-black text-[hsl(0,85%,65%)]">代打</span>
          </div>
          <span className="text-[10px] font-bold text-[hsl(210,20%,45%)]">
            {dragging ? "打者の上で離す" : "控えを長押しして打者へドラッグ"}
          </span>
        </div>

        {/* Current batter (drop target) */}
        <div className="border-b border-[hsl(210,40%,18%)] px-3 py-3">
          <div className="mb-1 text-[9px] font-bold tracking-wider text-[hsl(0,85%,55%)]">現在の打者</div>
          <div
            onPointerEnter={() => dragging && setHoverBatter(true)}
            onPointerLeave={() => setHoverBatter(false)}
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${
              hoverBatter
                ? "border-dashed border-[hsl(0,70%,50%)] bg-[hsl(0,30%,12%)] scale-[1.02]"
                : "border-[hsl(210,30%,20%)] bg-[hsl(210,50%,10%)]"
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(0,70%,20%)] text-sm font-black text-[hsl(0,85%,65%)]">
              {currentBatterIndex + 1}
            </span>
            <span className="flex-1 text-sm font-bold text-[hsl(48,100%,96%)]">{batterPlayer?.name ?? "-"}</span>
            <span className="rounded bg-[hsl(210,40%,18%)] px-2 py-0.5 text-[10px] font-bold text-[hsl(210,60%,65%)]">
              {POSITION_SHORT[batter.fieldPosition]}
            </span>
          </div>
        </div>

        {/* Bench players (drag sources) */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="mb-1 text-[9px] font-bold tracking-wider text-[hsl(210,20%,50%)]">控え</div>
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
                    : isSelected ? "border-2 border-[hsl(0,70%,50%)] bg-[hsl(0,25%,12%)]"
                    : "border border-[hsl(210,30%,18%)] bg-[hsl(210,50%,10%)]"
                  }`}
                  style={{ touchAction: "none" }}
                >
                  <GripVertical size={14} className="text-[hsl(210,20%,30%)]" />
                  <span className="flex-1 text-[11px] font-bold text-[hsl(48,100%,96%)]">{player?.name ?? "-"}</span>
                  <span className="text-[10px] font-bold text-[hsl(210,60%,65%)]">
                    {player ? POSITION_SHORT[player.position] : "-"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {dragging && (
          <div className="pointer-events-none fixed z-[60] rounded-lg border-2 border-[hsl(0,85%,55%)] bg-[hsl(0,20%,12%)] px-3 py-2 shadow-2xl opacity-90"
            style={{ left: dragging.x - 60, top: dragging.y - 20 }}>
            <span className="text-[11px] font-black text-[hsl(48,100%,96%)]">{benchPlayers[dragging.index]?.name}</span>
          </div>
        )}

        <div className="flex gap-3 border-t border-[hsl(210,40%,18%)] px-4 py-3">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl bg-[hsl(210,30%,15%)] py-3 text-sm font-black text-[hsl(210,20%,55%)] active:scale-95">
            キャンセル
          </button>
          <button type="button"
            onClick={() => { if (selectedBench !== null) onSubstitute(selectedBench); }}
            disabled={selectedBench === null}
            className={`flex-[2] rounded-xl py-3 text-sm font-black active:scale-95 ${
              selectedBench !== null ? "bg-[hsl(0,75%,45%)] text-white" : "bg-[hsl(210,25%,15%)] text-[hsl(210,15%,35%)]"
            }`}>
            代打を送る
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Pinch Run Panel: runners on base + bench =====
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
  // We need to find which lineup players are on each base
  // For simplicity, we'll show bases occupied and let user pick
  const benchPlayers = team.benchPlayers.map((id) => getPlayer(team, id));
  const lineupPlayers = team.lineup.map((slot) => getPlayer(team, slot.playerId));

  // Runners: map base index to lineup index (approximate: use batting order)
  // In a real app you'd track which specific player is on which base
  // For now, show all lineup players who could be runners
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
        // Find the lineup index for this runner
        const runnerInfo = runnerBases[hoverTarget.index];
        if (runnerInfo) {
          // Use a simple heuristic: baseIndex maps roughly to recent batters
          // For a real implementation, you'd track exact runner IDs per base
          const lineupIdx = runnerInfo.baseIndex; // simplified
          onSubstitute(lineupIdx, dragging.index);
        }
      } else if (dragging.source === "runner" && hoverTarget.source === "bench") {
        const runnerInfo = runnerBases[dragging.index];
        if (runnerInfo) {
          onSubstitute(runnerInfo.baseIndex, hoverTarget.index);
        }
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(210,80%,4%)]/80"
      onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <div className="flex max-h-[80vh] w-full max-w-md animate-[slideUp_0.25s_ease-out] flex-col rounded-t-2xl border-t-2 border-[hsl(120,60%,45%)] bg-[hsl(210,50%,8%)]">
        <div className="flex items-center justify-between border-b border-[hsl(210,40%,18%)] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Footprints size={14} className="text-[hsl(120,60%,45%)]" />
            <span className="text-sm font-black text-[hsl(120,60%,55%)]">代走</span>
          </div>
          <span className="text-[10px] font-bold text-[hsl(210,20%,45%)]">
            {isDragging ? "交代先で離す" : "長押しでドラッグ / タップで選択"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Runners on base */}
          <div className="border-b border-[hsl(210,40%,18%)] px-3 py-2">
            <div className="mb-1 text-[9px] font-bold tracking-wider text-[hsl(120,60%,45%)]">塁上のランナー</div>
            <div className="flex flex-col gap-1">
              {runnerBases.map((rb, i) => {
                const isDragged = dragging?.source === "runner" && dragging.index === i;
                const isHovered = hoverTarget?.source === "runner" && hoverTarget.index === i;
                const isSelected = selectedRunner === i;
                // Pick a representative player for this base
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
                      : isHovered ? "border-dashed border-[hsl(120,50%,40%)] bg-[hsl(120,15%,10%)]"
                      : isSelected ? "border-[hsl(120,60%,45%)] bg-[hsl(120,20%,12%)]"
                      : "border-[hsl(210,30%,20%)] bg-[hsl(210,50%,10%)]"
                    }`}
                    style={{ touchAction: "none" }}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(120,30%,18%)] text-[10px] font-black text-[hsl(120,60%,55%)]">
                      {rb.baseIndex + 1}塁
                    </span>
                    <span className="flex-1 text-[11px] font-bold text-[hsl(48,100%,96%)]">{player?.name ?? "-"}</span>
                    <GripVertical size={14} className="text-[hsl(210,20%,30%)]" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bench */}
          <div className="px-3 py-2">
            <div className="mb-1 text-[9px] font-bold tracking-wider text-[hsl(210,20%,50%)]">控え</div>
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
                      : isHovered ? "border-2 border-dashed border-[hsl(120,50%,40%)] bg-[hsl(120,15%,10%)]"
                      : isSelected ? "border-2 border-[hsl(120,50%,45%)] bg-[hsl(120,20%,12%)]"
                      : "border border-[hsl(210,30%,18%)] bg-[hsl(210,50%,10%)]"
                    }`}
                    style={{ touchAction: "none" }}
                  >
                    <GripVertical size={14} className="text-[hsl(210,20%,30%)]" />
                    <span className="flex-1 text-[11px] font-bold text-[hsl(48,100%,96%)]">{player?.name ?? "-"}</span>
                    <span className="text-[10px] font-bold text-[hsl(210,60%,65%)]">
                      {player ? POSITION_SHORT[player.position] : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {dragging && (
          <div className="pointer-events-none fixed z-[60] rounded-lg border-2 border-[hsl(120,60%,45%)] bg-[hsl(120,15%,10%)] px-3 py-2 shadow-2xl opacity-90"
            style={{ left: dragging.x - 60, top: dragging.y - 20 }}>
            <span className="text-[11px] font-black text-[hsl(48,100%,96%)]">
              {dragging.source === "runner"
                ? lineupPlayers[Math.min(runnerBases[dragging.index]?.baseIndex ?? 0, team.lineup.length - 1)]?.name
                : benchPlayers[dragging.index]?.name}
            </span>
          </div>
        )}

        <div className="flex gap-3 border-t border-[hsl(210,40%,18%)] px-4 py-3">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl bg-[hsl(210,30%,15%)] py-3 text-sm font-black text-[hsl(210,20%,55%)] active:scale-95">
            キャンセル
          </button>
          <button type="button" onClick={doConfirm}
            disabled={selectedRunner === null || selectedBench === null}
            className={`flex-[2] rounded-xl py-3 text-sm font-black active:scale-95 ${
              selectedRunner !== null && selectedBench !== null
                ? "bg-[hsl(120,50%,35%)] text-white" : "bg-[hsl(210,25%,15%)] text-[hsl(210,15%,35%)]"
            }`}>
            代走を送る
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Defense Change Panel: fielders + bench side by side, drag & drop =====
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

  const [selectedLineup, setSelectedLineup] = useState<number | null>(null);
  const [selectedBench, setSelectedBench] = useState<number | null>(null);
  const longPressRef = useRef<NodeJS.Timeout | null>(null);
  const [dragging, setDragging] = useState<{ source: "lineup" | "bench"; index: number; x: number; y: number } | null>(null);
  const [hoverTarget, setHoverTarget] = useState<{ source: "lineup" | "bench"; index: number } | null>(null);

  // Position swap mode within fielders
  const [posSwapMode, setPosSwapMode] = useState(false);
  const [posSwapFirst, setPosSwapFirst] = useState<number | null>(null);

  const clearLP = useCallback(() => { if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; } }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, source: "lineup" | "bench", index: number) => {
    if (posSwapMode) return; // don't drag in pos swap mode
    e.preventDefault();
    const x = e.clientX, y = e.clientY;
    longPressRef.current = setTimeout(() => { setDragging({ source, index, x, y }); }, 300);
  }, [posSwapMode]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging) setDragging((d) => d ? { ...d, x: e.clientX, y: e.clientY } : null);
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    clearLP();
    if (dragging && hoverTarget) {
      if (dragging.source !== hoverTarget.source) {
        const lineupIdx = dragging.source === "lineup" ? dragging.index : hoverTarget.index;
        const benchIdx = dragging.source === "bench" ? dragging.index : hoverTarget.index;
        onSubstitute(lineupIdx, benchIdx);
      }
    }
    setDragging(null);
    setHoverTarget(null);
  }, [dragging, hoverTarget, clearLP, onSubstitute]);

  useEffect(() => () => clearLP(), [clearLP]);

  const isDragging = dragging !== null;

  const doConfirm = () => {
    if (selectedLineup !== null && selectedBench !== null) {
      onSubstitute(selectedLineup, selectedBench);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(210,80%,4%)]/80"
      onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <div className="flex max-h-[85vh] w-full max-w-md animate-[slideUp_0.25s_ease-out] flex-col rounded-t-2xl border-t-2 border-[hsl(210,80%,55%)] bg-[hsl(210,50%,8%)]">
        <div className="flex items-center justify-between border-b border-[hsl(210,40%,18%)] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[hsl(210,80%,55%)]" />
            <span className="text-sm font-black text-[hsl(210,80%,65%)]">守備交代</span>
          </div>
          <span className="text-[10px] font-bold text-[hsl(210,20%,45%)]">
            {isDragging ? "交代先で離す" : "出場選手と控えをドラッグで交代"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {/* Each lineup slot with bench player options next to it */}
          <div className="flex flex-col gap-1">
            {lineupPlayers.map((player, i) => {
              const isDraggedLineup = dragging?.source === "lineup" && dragging.index === i;
              const isHoveredLineup = hoverTarget?.source === "lineup" && hoverTarget.index === i;
              const isSelectedLineup = selectedLineup === i;

              return (
                <div key={team.lineup[i].playerId} className="flex items-center gap-1">
                  {/* Lineup player */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, "lineup", i)}
                    onPointerEnter={() => isDragging && setHoverTarget({ source: "lineup", index: i })}
                    onClick={() => { if (!isDragging && !posSwapMode) setSelectedLineup(prev => prev === i ? null : i); }}
                    className={`flex flex-1 items-center gap-2 rounded-lg px-2 py-2 transition-all ${
                      isDraggedLineup ? "scale-95 opacity-40"
                      : isHoveredLineup ? "border-2 border-dashed border-[hsl(210,70%,50%)] bg-[hsl(210,30%,14%)]"
                      : isSelectedLineup ? "border-2 border-[hsl(210,80%,55%)] bg-[hsl(210,40%,14%)]"
                      : "border border-[hsl(210,30%,18%)] bg-[hsl(210,50%,10%)]"
                    }`}
                    style={{ touchAction: "none" }}
                  >
                    <span className="w-4 text-[10px] font-black text-[hsl(38,100%,50%)]">{i + 1}</span>
                    <span className="flex-1 truncate text-[11px] font-bold text-[hsl(48,100%,96%)]">{player?.name ?? "-"}</span>
                    <span className="rounded bg-[hsl(210,50%,20%)] px-1.5 py-0.5 text-[9px] font-black text-[hsl(210,70%,70%)]">
                      {POSITION_SHORT[team.lineup[i].fieldPosition]}
                    </span>
                  </div>

                  {/* Arrow */}
                  <span className="text-[10px] text-[hsl(210,20%,30%)]">{"<>"}</span>

                  {/* Mini bench list (scrollable horizontally) */}
                  <div className="flex w-[120px] shrink-0 gap-0.5 overflow-x-auto">
                    {benchPlayers.map((bp, bi) => {
                      const isDraggedBench = dragging?.source === "bench" && dragging.index === bi;
                      const isHoveredBench = hoverTarget?.source === "bench" && hoverTarget.index === bi;
                      const isSelectedB = selectedLineup === i && selectedBench === bi;
                      return (
                        <div
                          key={team.benchPlayers[bi]}
                          onPointerDown={(e) => handlePointerDown(e, "bench", bi)}
                          onPointerEnter={() => isDragging && setHoverTarget({ source: "bench", index: bi })}
                          onClick={() => {
                            if (!isDragging && !posSwapMode) {
                              if (selectedLineup === i) {
                                setSelectedBench(prev => prev === bi ? null : bi);
                              } else {
                                setSelectedLineup(i);
                                setSelectedBench(bi);
                              }
                            }
                          }}
                          className={`flex shrink-0 flex-col items-center rounded-md px-1.5 py-1 transition-all ${
                            isDraggedBench ? "scale-95 opacity-40"
                            : isHoveredBench ? "border border-dashed border-[hsl(210,70%,50%)] bg-[hsl(210,30%,14%)]"
                            : isSelectedB ? "border border-[hsl(210,80%,55%)] bg-[hsl(210,40%,14%)]"
                            : "border border-[hsl(210,25%,16%)] bg-[hsl(210,40%,8%)]"
                          }`}
                          style={{ touchAction: "none" }}
                        >
                          <span className="max-w-[50px] truncate text-[9px] font-bold text-[hsl(48,100%,90%)]">
                            {bp?.name?.split(" ").pop() ?? "-"}
                          </span>
                          <span className="text-[8px] text-[hsl(210,40%,50%)]">
                            {bp ? POSITION_SHORT[bp.position] : "-"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {dragging && (
          <div className="pointer-events-none fixed z-[60] rounded-lg border-2 border-[hsl(210,80%,55%)] bg-[hsl(210,40%,12%)] px-3 py-2 shadow-2xl opacity-90"
            style={{ left: dragging.x - 60, top: dragging.y - 20 }}>
            <span className="text-[11px] font-black text-[hsl(48,100%,96%)]">
              {dragging.source === "lineup"
                ? lineupPlayers[dragging.index]?.name
                : benchPlayers[dragging.index]?.name}
            </span>
          </div>
        )}

        <div className="flex gap-3 border-t border-[hsl(210,40%,18%)] px-4 py-3">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl bg-[hsl(210,30%,15%)] py-3 text-sm font-black text-[hsl(210,20%,55%)] active:scale-95">
            閉じる
          </button>
          <button type="button" onClick={doConfirm}
            disabled={selectedLineup === null || selectedBench === null}
            className={`flex-[2] rounded-xl py-3 text-sm font-black active:scale-95 ${
              selectedLineup !== null && selectedBench !== null
                ? "bg-[hsl(210,70%,45%)] text-white" : "bg-[hsl(210,25%,15%)] text-[hsl(210,15%,35%)]"
            }`}>
            交代する
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
    gameState,
    message,
    pendingPlay,
    handleAction,
    updatePendingSlot,
    cancelPending,
    confirmPending,
  } = useGame();

  const [timeoutMenu, setTimeoutMenu] = useState(false);
  const [pinchHitMode, setPinchHitMode] = useState(false);
  const [pinchRunMode, setPinchRunMode] = useState(false);
  const [defenseMode, setDefenseMode] = useState(false);

  // Sync game state to app provider for resume
  useEffect(() => {
    setActiveGameState(gameState);
  }, [gameState, setActiveGameState]);

  const hasRunners = gameState.bases[0] || gameState.bases[1] || gameState.bases[2];

  const handleTimeoutSelect = useCallback((action: "pinch-hit" | "pinch-run" | "defense-change") => {
    setTimeoutMenu(false);
    if (action === "pinch-hit") setPinchHitMode(true);
    else if (action === "pinch-run") setPinchRunMode(true);
    else if (action === "defense-change") setDefenseMode(true);
  }, []);

  // Figure out current batter index in lineup (use batting order position based on game state)
  const currentBatterIndex = 0; // simplified; in real app track per half-inning

  const handlePinchHit = useCallback((benchIndex: number) => {
    updateMyTeam((t) => {
      const newLineup = [...t.lineup];
      const newBench = [...t.benchPlayers];
      const oldSlot = newLineup[currentBatterIndex];
      const benchId = newBench[benchIndex];
      newLineup[currentBatterIndex] = { playerId: benchId, fieldPosition: oldSlot.fieldPosition };
      newBench[benchIndex] = oldSlot.playerId;
      return { ...t, lineup: newLineup, benchPlayers: newBench };
    });
    setPinchHitMode(false);
  }, [updateMyTeam, currentBatterIndex]);

  const handlePinchRun = useCallback((lineupIndex: number, benchIndex: number) => {
    updateMyTeam((t) => {
      const newLineup = [...t.lineup];
      const newBench = [...t.benchPlayers];
      const oldSlot = newLineup[lineupIndex];
      const benchId = newBench[benchIndex];
      newLineup[lineupIndex] = { playerId: benchId, fieldPosition: oldSlot.fieldPosition };
      newBench[benchIndex] = oldSlot.playerId;
      return { ...t, lineup: newLineup, benchPlayers: newBench };
    });
    setPinchRunMode(false);
  }, [updateMyTeam]);

  const handleDefenseSubstitute = useCallback((lineupIndex: number, benchIndex: number) => {
    updateMyTeam((t) => {
      const newLineup = [...t.lineup];
      const newBench = [...t.benchPlayers];
      const oldSlot = newLineup[lineupIndex];
      const benchId = newBench[benchIndex];
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
      homeTeam: state.myTeam.name,
      awayTeam: state.opponent.name,
      homeShort: state.myTeam.shortName,
      awayShort: state.opponent.shortName,
      homeColor: state.myTeam.color,
      awayColor: state.opponent.color,
      homeScore: gameState.home.runs,
      awayScore: gameState.away.runs,
      innings: { away: gameState.away.scores, home: gameState.home.scores },
      homeHits: gameState.home.hits,
      awayHits: gameState.away.hits,
      homeErrors: gameState.home.errors,
      awayErrors: gameState.away.errors,
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
    <div className="relative flex min-h-dvh flex-col bg-[hsl(210,70%,8%)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[hsl(210,40%,18%)] bg-[hsl(210,60%,6%)] px-3 py-2">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="flex items-center gap-1 text-[hsl(210,20%,55%)] active:opacity-70"
        >
          <ArrowLeft size={16} />
          <span className="text-[10px] font-bold">メニュー</span>
        </button>
        <button
          type="button"
          onClick={() => setTimeoutMenu(true)}
          className="flex items-center gap-1.5 rounded-lg border border-[hsl(38,60%,30%)] bg-[hsl(38,30%,12%)] px-3 py-1.5 text-[10px] font-black text-[hsl(38,100%,55%)] active:bg-[hsl(38,30%,18%)]"
        >
          <Clock size={13} />
          タイム
        </button>
      </div>

      <div className="flex w-full flex-1 flex-col">
        {/* Score HUD */}
        <div className="flex items-stretch border-b border-[hsl(210,50%,25%)] bg-[hsl(210,70%,8%)]">
          <div className="flex items-center gap-1 border-r border-[hsl(210,50%,25%)] px-3 py-2">
            <div className="flex flex-col items-center leading-none">
              <svg width="10" height="6" viewBox="0 0 10 6" className={gameState.isTop ? "opacity-100" : "opacity-20"} aria-hidden="true">
                <polygon points="5,0 10,6 0,6" fill={gameState.isTop ? "hsl(38, 100%, 50%)" : "hsl(210, 30%, 40%)"} />
              </svg>
              <svg width="10" height="6" viewBox="0 0 10 6" className={`mt-0.5 ${!gameState.isTop ? "opacity-100" : "opacity-20"}`} aria-hidden="true">
                <polygon points="5,6 10,0 0,0" fill={!gameState.isTop ? "hsl(38, 100%, 50%)" : "hsl(210, 30%, 40%)"} />
              </svg>
            </div>
            <span className="text-xl font-black text-[hsl(38,100%,50%)]">{gameState.inning}</span>
          </div>
          <div className="flex flex-1 items-center justify-center gap-4 px-3">
            <div className="flex items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${gameState.isTop ? "bg-[hsl(0,75%,45%)]" : "bg-[hsl(0,75%,45%)]/60"}`}>
                {gameState.away.shortName}
              </span>
              <span className="text-2xl font-black tabular-nums text-[hsl(48,100%,96%)]">{gameState.away.runs}</span>
            </div>
            <span className="text-sm font-bold text-[hsl(210,20%,40%)]">-</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tabular-nums text-[hsl(48,100%,96%)]">{gameState.home.runs}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${!gameState.isTop ? "bg-[hsl(210,80%,40%)]" : "bg-[hsl(210,80%,40%)]/60"}`}>
                {gameState.home.shortName}
              </span>
            </div>
          </div>
          <div className="flex items-center border-l border-[hsl(210,50%,25%)] px-3">
            <BaseDiamond bases={gameState.bases} size="sm" />
          </div>
        </div>

        <CountDisplay balls={gameState.balls} strikes={gameState.strikes} outs={gameState.outs} />
        <PlayerInfo batter={gameState.currentBatter} pitcher={gameState.currentPitcher} />
        <InningBoard home={gameState.home} away={gameState.away} currentInning={gameState.inning} isTop={gameState.isTop} />

        <div className="flex items-center justify-center bg-[hsl(210,60%,7%)] py-4">
          <BaseDiamond bases={gameState.bases} size="lg" />
        </div>

        <GameControls gameState={gameState} onAction={handleAction} />
      </div>

      {pendingPlay && (
        <RunnerResolution play={pendingPlay} onUpdate={updatePendingSlot} onCancel={cancelPending} onConfirm={confirmPending} />
      )}

      {timeoutMenu && (
        <TimeoutMenu hasRunners={hasRunners} onSelect={handleTimeoutSelect} onClose={() => setTimeoutMenu(false)} />
      )}

      {pinchHitMode && (
        <PinchHitPanel
          team={state.myTeam}
          currentBatterIndex={currentBatterIndex}
          onSubstitute={handlePinchHit}
          onClose={() => setPinchHitMode(false)}
        />
      )}

      {pinchRunMode && (
        <PinchRunPanel
          team={state.myTeam}
          bases={gameState.bases}
          onSubstitute={handlePinchRun}
          onClose={() => setPinchRunMode(false)}
        />
      )}

      {defenseMode && (
        <DefenseChangePanel
          team={state.myTeam}
          onSubstitute={handleDefenseSubstitute}
          onClose={() => setDefenseMode(false)}
        />
      )}

      {message && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="animate-bounce rounded-2xl border-4 border-[hsl(38,100%,50%)] bg-[hsl(210,80%,8%)] px-8 py-4 shadow-[0_0_60px_hsl(38,100%,50%,0.5)]">
            <span className="text-2xl font-black text-[hsl(38,100%,50%)]">{message}</span>
          </div>
        </div>
      )}

      {gameState.isGameOver && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-[hsl(210,80%,4%)]/80">
          <div className="pointer-events-auto flex flex-col items-center gap-4">
            <span className="text-4xl font-black text-[hsl(38,100%,50%)]">GAME SET</span>
            <div className="flex items-center gap-4 text-xl font-black text-[hsl(48,100%,96%)]">
              <span>{gameState.away.shortName} {gameState.away.runs}</span>
              <span className="text-[hsl(210,20%,40%)]">-</span>
              <span>{gameState.home.runs} {gameState.home.shortName}</span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { handleAction("reset"); setActiveGameState(null); }}
                className="rounded-xl bg-[hsl(210,30%,18%)] px-6 py-3 text-sm font-black text-[hsl(210,20%,60%)] active:scale-95"
              >
                もう一度
              </button>
              <button
                type="button"
                onClick={handleGameEnd}
                className="rounded-xl bg-[hsl(38,100%,50%)] px-8 py-3 text-sm font-black text-[hsl(210,80%,8%)] active:scale-95"
              >
                結果を保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
