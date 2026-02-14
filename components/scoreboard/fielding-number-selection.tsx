"use client";

const POSITION_NAMES: Record<number, string> = {
  1: "投",
  2: "捕",
  3: "一",
  4: "二",
  5: "三",
  6: "遊",
  7: "左",
  8: "中",
  9: "右",
};

interface FieldingNumberSelectionProps {
  actionLabel: string;
  numbers: number[];
  onUpdate: (numbers: number[]) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FieldingNumberSelection({
  actionLabel,
  numbers,
  onUpdate,
  onConfirm,
  onCancel,
}: FieldingNumberSelectionProps) {
  const handleTap = (num: number) => {
    // Count consecutive trailing occurrences of this number
    let trailing = 0;
    for (let i = numbers.length - 1; i >= 0; i--) {
      if (numbers[i] === num) trailing++;
      else break;
    }

    if (trailing === 0) {
      // Not at end: just add
      onUpdate([...numbers, num]);
    } else if (trailing === 1) {
      // 1 consecutive at end: add again (same player twice)
      onUpdate([...numbers, num]);
    } else {
      // 2+ consecutive at end: reset (remove all trailing)
      onUpdate(numbers.slice(0, numbers.length - trailing));
    }
  };

  const displayText = numbers.length > 0
    ? numbers.join("→")
    : "守備番号をタップ";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="w-full max-w-md animate-[slideUp_0.25s_ease-out] rounded-t-2xl border-t-2 border-[#2563EB] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <span className="text-sm font-black text-[#2563EB]">{actionLabel}</span>
          <span className="text-[10px] font-bold text-[#9CA3AF]">守備番号を選択</span>
        </div>

        <div className="border-b border-[#E5E7EB] px-4 py-3">
          <div className={`rounded-xl border-2 px-4 py-3 text-center text-lg font-black ${
            numbers.length > 0
              ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
              : "border-[#E5E7EB] bg-[#F9FAFB] text-[#D1D5DB]"
          }`}>
            {displayText}
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleTap(num)}
                className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-white py-3 transition-all active:scale-95 active:bg-[#F3F4F6]"
              >
                <span className="text-xl font-black text-[#1A1D23]">{num}</span>
                <span className="mt-0.5 text-[9px] font-bold text-[#9CA3AF]">{POSITION_NAMES[num]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 border-t border-[#E5E7EB] px-4 py-3">
          <button type="button" onClick={onCancel}
            className="flex-1 rounded-xl bg-[#F3F4F6] py-3 text-sm font-black text-[#6B7280] active:scale-95">
            キャンセル
          </button>
          <button type="button" onClick={onConfirm} disabled={numbers.length === 0}
            className={`flex-[2] rounded-xl py-3 text-sm font-black active:scale-95 ${
              numbers.length > 0
                ? "bg-[#2563EB] text-white"
                : "bg-[#F3F4F6] text-[#D1D5DB]"
            }`}>
            完了
          </button>
        </div>
      </div>
    </div>
  );
}
