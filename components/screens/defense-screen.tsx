"use client";

import { useAppContext } from "@/lib/store";
import {
  POSITION_ORDER,
  POSITION_SHORT,
  getPlayer,
  type Position,
  type Player,
} from "@/lib/team-data";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import { useState, useCallback } from "react";

type SwapState =
  | { mode: "none" }
  | { mode: "selected"; slotIndex: number };

function DefenseSlot({
  position,
  player,
  isSelected,
  isSwapTarget,
  onTap,
}: {
  position: Position;
  player: Player | undefined;
  isSelected: boolean;
  isSwapTarget: boolean;
  onTap: () => void;
}) {
  if (!player) return null;

  return (
    <button
      type="button"
      onClick={onTap}
      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all active:scale-[0.98] ${
        isSelected
          ? "border-2 border-[hsl(38,100%,50%)] bg-[hsl(38,30%,14%)] shadow-[0_0_12px_hsl(38,100%,50%,0.2)]"
          : isSwapTarget
          ? "border-2 border-dashed border-[hsl(120,50%,40%)] bg-[hsl(120,15%,10%)]"
          : "border border-[hsl(210,30%,18%)] bg-[hsl(210,50%,8%)]"
      }`}
    >
      {/* Player info */}
      <div className="flex flex-1 items-center gap-1.5 overflow-hidden">
        <span className="text-[10px] font-bold tabular-nums text-[hsl(210,20%,50%)]">
          #{player.number}
        </span>
        <span className="truncate text-xs font-black text-[hsl(48,100%,96%)]">
          {player.name}
        </span>
      </div>

      {/* Position badge */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[hsl(210,60%,25%)]">
        <span className="text-[10px] font-black text-[hsl(48,100%,96%)]">
          {POSITION_SHORT[position]}
        </span>
      </div>

      {isSelected && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(38,100%,50%)]">
          <ArrowLeftRight size={12} className="text-[hsl(210,80%,8%)]" />
        </div>
      )}
    </button>
  );
}

export function DefenseScreen() {
  const { state, navigate, updateMyTeam } = useAppContext();
  const team = state.myTeam;
  const [swapState, setSwapState] = useState<SwapState>({ mode: "none" });

  const positionSlots = POSITION_ORDER.map((pos) => {
    const slotIdx = team.lineup.findIndex((s) => s.fieldPosition === pos);
    const slot = slotIdx >= 0 ? team.lineup[slotIdx] : null;
    const player = slot ? getPlayer(team, slot.playerId) : undefined;
    return { pos, slotIdx, slot, player };
  });

  const handleTap = useCallback(
    (slotIdx: number) => {
      if (swapState.mode === "none") {
        setSwapState({ mode: "selected", slotIndex: slotIdx });
      } else if (swapState.mode === "selected") {
        if (swapState.slotIndex === slotIdx) {
          setSwapState({ mode: "none" });
          return;
        }

        const fromIdx = swapState.slotIndex;
        const toIdx = slotIdx;

        updateMyTeam((t) => {
          const newLineup = [...t.lineup];
          const fromSlot = newLineup[fromIdx];
          const toSlot = newLineup[toIdx];

          newLineup[fromIdx] = { playerId: toSlot.playerId, fieldPosition: fromSlot.fieldPosition };
          newLineup[toIdx] = { playerId: fromSlot.playerId, fieldPosition: toSlot.fieldPosition };

          return { ...t, lineup: newLineup };
        });
        setSwapState({ mode: "none" });
      }
    },
    [swapState, updateMyTeam]
  );

  return (
    <div className="flex min-h-dvh flex-col bg-[hsl(210,70%,6%)]">
      {/* Header */}
      <div className="flex items-center border-b border-[hsl(210,40%,18%)] bg-[hsl(210,60%,8%)] px-3 py-2.5">
        <button
          type="button"
          onClick={() => navigate("lineup")}
          className="flex items-center gap-1 text-[hsl(210,20%,55%)] active:opacity-70"
        >
          <ArrowLeft size={18} />
          <span className="text-xs font-bold">戻る</span>
        </button>
        <h2 className="flex-1 text-center text-sm font-black text-[hsl(38,100%,50%)]">
          守備位置
        </h2>
        <div className="w-12" />
      </div>

      {/* Swap instruction */}
      {swapState.mode === "selected" ? (
        <div className="flex items-center justify-center gap-2 bg-[hsl(38,25%,11%)] px-4 py-1.5">
          <ArrowLeftRight size={14} className="text-[hsl(38,100%,50%)]" />
          <span className="text-xs font-bold text-[hsl(38,100%,50%)]">
            入れ替えるポジションをタップ
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center bg-[hsl(210,40%,9%)] px-4 py-1.5">
          <span className="text-[10px] text-[hsl(210,20%,40%)]">
            選手をタップして守備位置を入れ替え
          </span>
        </div>
      )}

      {/* Defense positions list */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-[hsl(38,100%,50%,0.4)]" />
            <span className="text-[10px] font-black tracking-wider text-[hsl(38,100%,50%)]">
              DEFENSE POSITION
            </span>
            <div className="h-px flex-1 bg-[hsl(38,100%,50%,0.4)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            {positionSlots.map(({ pos, slotIdx, player }) => {
              if (slotIdx < 0 || !player) return null;
              const isSelectedSlot = swapState.mode === "selected" && swapState.slotIndex === slotIdx;
              const isSwapTarget = swapState.mode === "selected" && swapState.slotIndex !== slotIdx;

              return (
                <DefenseSlot
                  key={pos}
                  position={pos}
                  player={player}
                  isSelected={isSelectedSlot}
                  isSwapTarget={isSwapTarget}
                  onTap={() => handleTap(slotIdx)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
