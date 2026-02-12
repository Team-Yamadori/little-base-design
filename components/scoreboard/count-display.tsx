"use client";

interface CountDisplayProps {
  balls: number;
  strikes: number;
  outs: number;
}

export function CountDisplay({ balls, strikes, outs }: CountDisplayProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-black text-[#16A34A]">B</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-4 w-4 rounded-full border transition-all ${
              i < balls ? "border-[#16A34A] bg-[#16A34A]" : "border-[#D1D5DB] bg-[#F3F4F6]"
            }`} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-black text-[#F59E0B]">S</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-4 w-4 rounded-full border transition-all ${
              i < strikes ? "border-[#F59E0B] bg-[#F59E0B]" : "border-[#D1D5DB] bg-[#F3F4F6]"
            }`} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-black text-[#DC2626]">O</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-4 w-4 rounded-full border transition-all ${
              i < outs ? "border-[#DC2626] bg-[#DC2626]" : "border-[#D1D5DB] bg-[#F3F4F6]"
            }`} />
          ))}
        </div>
      </div>
    </div>
  );
}
