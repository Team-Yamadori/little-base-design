"use client";

import { useAppContext } from "@/lib/store";
import { POSITION_SHORT, getPlayer } from "@/lib/team-data";
import { ArrowLeft, Swords } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";

type DragState =
  | { mode: "none" }
  | { mode: "dragging"; slotType: "lineup" | "bench"; slotIndex: number; startX: number; startY: number; currentX: number; currentY: number };

export function LineupScreen() {
  const { state, navigate, goBack, updateMyTeam } = useAppContext();
  const team = state.myTeam;
  const [dragState, setDragState] = useState<DragState>({ mode: "none" });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hoverSlot, setHoverSlot] = useState<{ type: "lineup" | "bench"; index: number } | null>(null);

  const lineupPlayers = team.lineup.map((slot) => getPlayer(team, slot.playerId));
  const benchPlayers = team.benchPlayers.map((id) => getPlayer(team, id));

  const clearLongPress = useCallback(() => { if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; } }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, slotType: "lineup" | "bench", index: number) => {
    e.preventDefault();
    const touch = e;
    longPressTimerRef.current = setTimeout(() => {
      setDragState({ mode: "dragging", slotType, slotIndex: index, startX: touch.clientX, startY: touch.clientY, currentX: touch.clientX, currentY: touch.clientY });
    }, 300);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragState.mode === "dragging") { e.preventDefault(); setDragState({ ...dragState, currentX: e.clientX, currentY: e.clientY }); }
  }, [dragState]);

  const handlePointerUp = useCallback(() => {
    clearLongPress();
    if (dragState.mode === "dragging" && hoverSlot) {
      const from = { type: dragState.slotType, index: dragState.slotIndex };
      const to = hoverSlot;
      if (from.type !== to.type || from.index !== to.index) {
        updateMyTeam((t) => {
          const newLineup = [...t.lineup]; const newBench = [...t.benchPlayers];
          if (from.type === "lineup" && to.type === "lineup") { const temp = newLineup[from.index]; newLineup[from.index] = newLineup[to.index]; newLineup[to.index] = temp; }
          else if (from.type === "lineup" && to.type === "bench") { const ls = newLineup[from.index]; const bid = newBench[to.index]; newLineup[from.index] = { playerId: bid, fieldPosition: ls.fieldPosition }; newBench[to.index] = ls.playerId; }
          else if (from.type === "bench" && to.type === "lineup") { const ls = newLineup[to.index]; const bid = newBench[from.index]; newLineup[to.index] = { playerId: bid, fieldPosition: ls.fieldPosition }; newBench[from.index] = ls.playerId; }
          else if (from.type === "bench" && to.type === "bench") { const temp = newBench[from.index]; newBench[from.index] = newBench[to.index]; newBench[to.index] = temp; }
          return { ...t, lineup: newLineup, benchPlayers: newBench };
        });
      }
    }
    setDragState({ mode: "none" }); setHoverSlot(null);
  }, [dragState, hoverSlot, clearLongPress, updateMyTeam]);

  const handlePointerCancel = useCallback(() => { clearLongPress(); setDragState({ mode: "none" }); setHoverSlot(null); }, [clearLongPress]);
  const handleSlotPointerEnter = useCallback((slotType: "lineup" | "bench", index: number) => { if (dragState.mode === "dragging") setHoverSlot({ type: slotType, index }); }, [dragState]);

  useEffect(() => () => clearLongPress(), [clearLongPress]);

  const isDragging = dragState.mode === "dragging";
  const draggedSlot = isDragging ? { type: dragState.slotType, index: dragState.slotIndex } : null;

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8F9FB] pb-16"
      onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel}>
      {/* Header */}
      <div className="flex items-center border-b border-[#E5E7EB] bg-white px-3 py-2.5">
        <button type="button" onClick={() => { if (!isDragging) goBack(); }} className="flex items-center gap-1 text-[#6B7280] active:opacity-70">
          <ArrowLeft size={18} /><span className="text-xs font-bold">{"戻る"}</span>
        </button>
        <h2 className="flex-1 text-center text-sm font-black text-[#1A1D23]">{"オーダー・守備設定"}</h2>
        <div className="w-12" />
      </div>

      {/* Hint bar */}
      <div className={`flex items-center justify-center px-4 py-1.5 ${isDragging ? "bg-[#EFF6FF]" : "bg-[#F3F4F6]"}`}>
        <span className={`text-[10px] font-bold ${isDragging ? "text-[#2563EB]" : "text-[#9CA3AF]"}`}>
          {isDragging ? "入れ替える位置で指を離す" : "長押しで選手を移動"}
        </span>
      </div>

      {/* Main: starters left, bench right */}
      <div className="flex flex-1 gap-1.5 overflow-hidden px-1.5 py-2">
        {/* Starting Lineup */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mb-1.5 flex items-center gap-1.5 px-1">
            <div className="h-px flex-1 bg-[#2563EB]/20" />
            <span className="text-[8px] font-black tracking-wider text-[#2563EB]">STARTING</span>
            <div className="h-px flex-1 bg-[#2563EB]/20" />
          </div>
          <div className="flex flex-col gap-1">
            {lineupPlayers.map((player, i) => {
              if (!player) return null;
              const isDragged = draggedSlot?.type === "lineup" && draggedSlot.index === i;
              const isHovered = hoverSlot?.type === "lineup" && hoverSlot.index === i && !isDragged;
              return (
                <div key={team.lineup[i].playerId} onPointerDown={(e) => handlePointerDown(e, "lineup", i)} onPointerEnter={() => handleSlotPointerEnter("lineup", i)}
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-2 transition-all ${
                    isDragged ? "scale-95 opacity-40" : isHovered ? "border-2 border-dashed border-[#2563EB] bg-[#EFF6FF]" : "border border-[#E5E7EB] bg-white shadow-sm"
                  } ${isDragging ? "" : "active:scale-95"}`} style={{ touchAction: "none" }}>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#EFF6FF]">
                    <span className="text-[10px] font-black text-[#2563EB]">{i + 1}</span>
                  </div>
                  <div className="flex flex-1 items-center gap-1 overflow-hidden">
                    <span className="text-[9px] font-bold tabular-nums text-[#9CA3AF]">#{player.number}</span>
                    <span className="truncate text-[11px] font-black text-[#1A1D23]">{player.name}</span>
                  </div>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F3F4F6]">
                    <span className="text-[10px] font-black text-[#374151]">{POSITION_SHORT[team.lineup[i].fieldPosition]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bench */}
        <div className="flex w-[120px] shrink-0 flex-col overflow-y-auto">
          <div className="mb-1.5 flex items-center gap-1 px-1">
            <div className="h-px flex-1 bg-[#D1D5DB]" />
            <span className="text-[8px] font-black tracking-wider text-[#9CA3AF]">BENCH</span>
            <div className="h-px flex-1 bg-[#D1D5DB]" />
          </div>
          <div className="flex flex-col gap-1">
            {benchPlayers.map((player, i) => {
              if (!player) return null;
              const isDragged = draggedSlot?.type === "bench" && draggedSlot.index === i;
              const isHovered = hoverSlot?.type === "bench" && hoverSlot.index === i && !isDragged;
              return (
                <div key={team.benchPlayers[i]} onPointerDown={(e) => handlePointerDown(e, "bench", i)} onPointerEnter={() => handleSlotPointerEnter("bench", i)}
                  className={`flex items-center gap-1 rounded-lg px-1.5 py-2 transition-all ${
                    isDragged ? "scale-95 opacity-40" : isHovered ? "border-2 border-dashed border-[#2563EB] bg-[#EFF6FF]" : "border border-[#E5E7EB] bg-white shadow-sm"
                  } ${isDragging ? "" : "active:scale-95"}`} style={{ touchAction: "none" }}>
                  <div className="flex flex-1 flex-col items-start overflow-hidden">
                    <span className="w-full truncate text-[10px] font-black text-[#1A1D23]">{player.name}</span>
                    <span className="text-[8px] text-[#9CA3AF]">#{player.number}</span>
                  </div>
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#F3F4F6]">
                    <span className="text-[9px] font-black text-[#374151]">{POSITION_SHORT[player.position]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating dragged item */}
      {isDragging && draggedSlot && (
        <div className="pointer-events-none fixed z-50 opacity-90" style={{ left: dragState.currentX - 40, top: dragState.currentY - 20, width: draggedSlot.type === "lineup" ? "200px" : "100px" }}>
          {draggedSlot.type === "lineup" ? (
            <div className="flex items-center gap-1.5 rounded-lg border-2 border-[#2563EB] bg-white px-2 py-2 shadow-xl">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#EFF6FF]"><span className="text-[10px] font-black text-[#2563EB]">{draggedSlot.index + 1}</span></div>
              <div className="flex flex-1 items-center gap-1 overflow-hidden">
                <span className="text-[9px] font-bold tabular-nums text-[#9CA3AF]">#{lineupPlayers[draggedSlot.index]?.number}</span>
                <span className="truncate text-[11px] font-black text-[#1A1D23]">{lineupPlayers[draggedSlot.index]?.name}</span>
              </div>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F3F4F6]"><span className="text-[10px] font-black text-[#374151]">{POSITION_SHORT[team.lineup[draggedSlot.index].fieldPosition]}</span></div>
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-lg border-2 border-[#2563EB] bg-white px-1.5 py-2 shadow-xl">
              <div className="flex flex-1 flex-col items-start overflow-hidden">
                <span className="w-full truncate text-[10px] font-black text-[#1A1D23]">{benchPlayers[draggedSlot.index]?.name}</span>
                <span className="text-[8px] text-[#9CA3AF]">#{benchPlayers[draggedSlot.index]?.number}</span>
              </div>
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#F3F4F6]"><span className="text-[9px] font-black text-[#374151]">{POSITION_SHORT[benchPlayers[draggedSlot.index]?.position!]}</span></div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Action */}
      <div className="border-t border-[#E5E7EB] bg-white px-4 py-3">
        <button type="button" onClick={() => { if (!isDragging) navigate("game"); }} disabled={isDragging}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DC2626] py-3 text-sm font-black text-white shadow-md active:scale-[0.98] disabled:opacity-50">
          <Swords size={16} />{"プレイボール!"}
        </button>
      </div>
    </div>
  );
}
