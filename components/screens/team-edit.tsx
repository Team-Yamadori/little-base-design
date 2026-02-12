"use client";

import { useAppContext } from "@/lib/store";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

const TEAM_COLORS = [
  { label: "赤", color: "hsl(0, 85%, 55%)", sub: "hsl(0, 70%, 35%)" },
  { label: "青", color: "hsl(210, 80%, 45%)", sub: "hsl(210, 60%, 30%)" },
  { label: "緑", color: "hsl(145, 60%, 40%)", sub: "hsl(145, 50%, 25%)" },
  { label: "橙", color: "hsl(25, 90%, 50%)", sub: "hsl(25, 70%, 30%)" },
  { label: "黒", color: "hsl(0, 0%, 25%)", sub: "hsl(0, 0%, 15%)" },
  { label: "金", color: "hsl(38, 100%, 50%)", sub: "hsl(38, 80%, 30%)" },
  { label: "水", color: "hsl(180, 60%, 45%)", sub: "hsl(180, 50%, 28%)" },
  { label: "紺", color: "hsl(230, 55%, 38%)", sub: "hsl(230, 45%, 22%)" },
];

export function TeamEdit() {
  const { state, updateMyTeam, goBack } = useAppContext();
  const team = state.myTeam;
  const [name, setName] = useState(team.name);
  const [shortName, setShortName] = useState(team.shortName);
  const [colorIndex, setColorIndex] = useState(Math.max(0, TEAM_COLORS.findIndex((c) => c.color === team.color)));

  const handleSave = () => {
    updateMyTeam((t) => ({ ...t, name: name || t.name, shortName: shortName || t.shortName, color: TEAM_COLORS[colorIndex].color, subColor: TEAM_COLORS[colorIndex].sub }));
    goBack();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8F9FB]">
      <div className="flex items-center border-b border-[#E5E7EB] bg-white px-3 py-3">
        <button type="button" onClick={goBack} className="flex items-center gap-1 text-[#6B7280] active:opacity-70">
          <ArrowLeft size={18} /><span className="text-xs font-bold">{"戻る"}</span>
        </button>
        <h2 className="flex-1 text-center text-sm font-black text-[#1A1D23]">{"チーム編集"}</h2>
        <div className="w-12" />
      </div>

      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        <div className="flex items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl text-xl font-black text-white" style={{ backgroundColor: TEAM_COLORS[colorIndex].color }}>
            {shortName || team.shortName}
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-[#1A1D23]">{name || team.name}</span>
            <span className="text-[10px] text-[#9CA3AF]">{"マイチーム"}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#6B7280]" htmlFor="team-name">{"チーム名"}</label>
            <input id="team-name" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={12}
              className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#1A1D23] shadow-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" placeholder="チーム名を入力" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#6B7280]" htmlFor="team-short">{"略称 (2文字)"}</label>
            <input id="team-short" type="text" value={shortName} onChange={(e) => setShortName(e.target.value.slice(0, 2))} maxLength={2}
              className="w-24 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#1A1D23] shadow-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" placeholder="略称" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-[#6B7280]">{"チームカラー"}</span>
          <div className="grid grid-cols-4 gap-3">
            {TEAM_COLORS.map((c, i) => (
              <button key={c.label} type="button" onClick={() => setColorIndex(i)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border-2 bg-white py-3 transition-all active:scale-95 ${
                  colorIndex === i ? "border-[#1A1D23] shadow-md" : "border-[#E5E7EB]"
                }`}>
                <div className="relative h-8 w-8 rounded-full" style={{ backgroundColor: c.color }}>
                  {colorIndex === i && <div className="absolute inset-0 flex items-center justify-center"><Check size={14} className="text-white" /></div>}
                </div>
                <span className="text-[9px] font-bold text-[#6B7280]">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleSave}
          className="mt-auto rounded-xl bg-[#2563EB] py-4 text-sm font-black text-white shadow-md active:scale-[0.98]">
          {"保存する"}
        </button>
      </div>
    </div>
  );
}
