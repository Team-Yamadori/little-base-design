"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/store";

const TEAM_COLORS = [
  { name: "レッド", value: "hsl(0,70%,50%)" },
  { name: "ブルー", value: "hsl(210,70%,50%)" },
  { name: "グリーン", value: "hsl(140,60%,40%)" },
  { name: "オレンジ", value: "hsl(30,90%,50%)" },
  { name: "パープル", value: "hsl(270,60%,50%)" },
  { name: "イエロー", value: "hsl(50,90%,50%)" },
  { name: "ピンク", value: "hsl(340,70%,55%)" },
  { name: "ネイビー", value: "hsl(220,60%,30%)" },
];

export function TeamCreateScreen() {
  const { updateMyTeam, setTeamCreated } = useAppContext();
  const [teamName, setTeamName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0].value);
  const [step, setStep] = useState<1 | 2>(1);

  const handleNext = () => {
    if (teamName.trim().length === 0) return;
    setStep(2);
  };

  const handleCreate = () => {
    updateMyTeam((team) => ({
      ...team,
      name: teamName.trim(),
      color: selectedColor,
    }));
    setTeamCreated();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8F9FB]">
      {/* Header */}
      <div className="flex flex-col items-center px-4 pb-4 pt-8">
        <div className="mb-1 text-[10px] font-bold tracking-[0.2em] text-[#2563EB]">
          {"STEP"} {step} / 2
        </div>
        <h1 className="text-lg font-black text-[#1A1D23]">
          {step === 1 ? "チーム名を入力" : "チームカラーを選択"}
        </h1>
      </div>

      {/* Progress bar */}
      <div className="mx-6 mb-6 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>

      {step === 1 ? (
        <div className="flex flex-1 flex-col items-center px-6">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF] shadow-sm">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="mb-6 text-center text-xs text-[#6B7280]">
            {"あなたのチーム名を入力してください"}
          </p>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="例: あかつき大附属"
            maxLength={20}
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-center text-base font-bold text-[#1A1D23] placeholder-[#9CA3AF] shadow-sm outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            autoFocus
          />
          <p className="mt-2 text-[10px] text-[#9CA3AF]">
            {teamName.length}/20
          </p>

          <button
            onClick={handleNext}
            disabled={teamName.trim().length === 0}
            className="mt-8 w-full rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100"
          >
            {"次へ"}
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center px-6">
          {/* Preview */}
          <div
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg"
            style={{ backgroundColor: selectedColor }}
          >
            <span className="text-2xl font-black text-white/90">
              {teamName.charAt(0)}
            </span>
          </div>
          <p className="mb-1 text-base font-bold text-[#1A1D23]">
            {teamName}
          </p>
          <p className="mb-6 text-xs text-[#6B7280]">
            {"チームカラーを選んでください"}
          </p>

          {/* Color Grid */}
          <div className="grid w-full grid-cols-4 gap-3">
            {TEAM_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedColor(c.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 bg-white p-2 transition-all ${
                  selectedColor === c.value
                    ? "border-[#1A1D23] shadow-md"
                    : "border-transparent"
                }`}
              >
                <div
                  className="h-10 w-10 rounded-full shadow-sm"
                  style={{ backgroundColor: c.value }}
                />
                <span className="text-[9px] text-[#6B7280]">
                  {c.name}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex w-full gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#6B7280] transition-all active:scale-95"
            >
              {"戻る"}
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-95"
              style={{ backgroundColor: selectedColor }}
            >
              {"チームを作成"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
