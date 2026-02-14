"use client";

import {
  type Destination,
  DEST_COLORS,
  DEST_LABELS,
  type PendingPlay,
  type RunnerSlot,
} from "@/lib/game-state";

interface RunnerResolutionProps {
  play: PendingPlay;
  onUpdate: (slotIndex: number, dest: Destination) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const FROM_LABELS: Record<string, string> = {
  batter: "打",
  "1B": "1",
  "2B": "2",
  "3B": "3",
};

const FROM_COLORS: Record<string, string> = {
  batter: "bg-[#2563EB]",
  "1B": "bg-[#3B82F6]",
  "2B": "bg-[#0891B2]",
  "3B": "bg-[#D97706]",
};

const FROM_ORDER: Record<string, number> = { batter: 0, "1B": 1, "2B": 2, "3B": 3 };

const DEST_VALUE: Record<string, number> = { "1B": 1, "2B": 2, "3B": 3, home: 4 };

function getEffectiveBase(slot: RunnerSlot): number | null {
  const d = slot.destination;
  if (d === "out" || d === "home") return null;
  if (d === "stay") return FROM_ORDER[slot.from] ?? null;
  return DEST_VALUE[d] ?? null;
}

function getFilteredOptions(
  sortedIdx: number,
  sortedSlots: { slot: RunnerSlot; originalIndex: number }[],
): Destination[] {
  const { slot } = sortedSlots[sortedIdx];

  // Find the closest occupied base among runners ahead (higher index = closer to home)
  let minAheadBase: number | null = null;
  for (let j = sortedIdx + 1; j < sortedSlots.length; j++) {
    const pos = getEffectiveBase(sortedSlots[j].slot);
    if (pos !== null && (minAheadBase === null || pos < minAheadBase)) {
      minAheadBase = pos;
    }
  }

  if (minAheadBase === null) return slot.options;

  return slot.options.filter((opt) => {
    if (opt === "out" || opt === "stay") return true;
    const val = DEST_VALUE[opt];
    if (val === undefined) return true;
    return val < minAheadBase;
  });
}

export function RunnerResolution({ play, onUpdate, onCancel, onConfirm }: RunnerResolutionProps) {
  // Sort: batter → 1B → 2B → 3B
  const sortedSlots = play.slots
    .map((slot, i) => ({ slot, originalIndex: i }))
    .sort((a, b) => FROM_ORDER[a.slot.from] - FROM_ORDER[b.slot.from]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="w-full max-w-md animate-[slideUp_0.25s_ease-out] rounded-t-2xl border-t-2 border-[#2563EB] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <span className="text-sm font-black text-[#2563EB]">{play.actionLabel}</span>
          <span className="text-[10px] font-bold text-[#9CA3AF]">各走者の結果を指定</span>
        </div>

        <div className="flex flex-col gap-2 px-4 py-3">
          {sortedSlots.map(({ slot, originalIndex }, sortedIdx) => {
            const filteredOptions = getFilteredOptions(sortedIdx, sortedSlots);
            if (filteredOptions.length === 0) return null;

            return (
              <div key={slot.from} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white ${FROM_COLORS[slot.from]}`}>
                  {FROM_LABELS[slot.from]}
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0 text-[#D1D5DB]" aria-hidden="true">
                  <path d="M3 8h8M8 5l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex flex-1 gap-1.5">
                  {filteredOptions.map((opt) => {
                    const selected = slot.destination === opt;
                    const colors = DEST_COLORS[opt];
                    return (
                      <button key={opt} type="button" onClick={() => onUpdate(originalIndex, opt)}
                        className={`flex-1 rounded-lg py-2 text-center text-xs font-black transition-all active:scale-95 ${
                          selected
                            ? `${colors.activeBg} ${colors.text} ring-2 ring-[#2563EB]`
                            : `${colors.bg} ${colors.text} opacity-50`
                        }`}>
                        {DEST_LABELS[opt]}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 border-t border-[#E5E7EB] px-4 py-3">
          <button type="button" onClick={onCancel}
            className="flex-1 rounded-xl bg-[#F3F4F6] py-3 text-sm font-black text-[#6B7280] active:scale-95">
            キャンセル
          </button>
          <button type="button" onClick={onConfirm}
            className="flex-[2] rounded-xl bg-[#2563EB] py-3 text-sm font-black text-white active:scale-95">
            確定
          </button>
        </div>
      </div>
    </div>
  );
}
