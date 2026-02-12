"use client";

import { useAppContext } from "@/lib/store";
import { formatAvg } from "@/lib/team-data";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export function GameDetailScreen() {
  const { state, goBack, selectedGameId } = useAppContext();
  const record = state.gameRecords.find((r) => r.id === selectedGameId);
  const [activeTab, setActiveTab] = useState<"score" | "batting" | "pitching">("score");

  if (!record) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F8F9FB]">
        <span className="text-sm text-[#6B7280]">{"試合データが見つかりません"}</span>
        <button type="button" onClick={goBack} className="mt-4 rounded-xl bg-[#2563EB] px-6 py-2 text-sm font-bold text-white">{"戻る"}</button>
      </div>
    );
  }

  const homeWin = record.homeScore > record.awayScore;
  const innings = Array.from({ length: Math.max(9, record.innings.away.length) }, (_, i) => i);

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8F9FB]">
      <div className="flex items-center border-b border-[#E5E7EB] bg-white px-3 py-3">
        <button type="button" onClick={goBack} className="flex items-center gap-1 text-[#6B7280] active:opacity-70">
          <ArrowLeft size={18} /><span className="text-xs font-bold">{"戻る"}</span>
        </button>
        <h2 className="flex-1 text-center text-sm font-black text-[#1A1D23]">{"試合詳細"}</h2>
        <span className="text-[10px] text-[#9CA3AF]">{record.date}</span>
      </div>

      {/* Big Score */}
      <div className="border-b border-[#E5E7EB] bg-white px-4 py-5">
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black text-white" style={{ backgroundColor: record.awayColor }}>{record.awayShort}</div>
            <span className="text-[10px] font-bold text-[#6B7280]">{record.awayTeam}</span>
            {!homeWin && <span className="rounded-md bg-[#2563EB] px-2 py-0.5 text-[8px] font-black text-white">WIN</span>}
          </div>
          <div className="flex items-baseline gap-4">
            <span className={`text-5xl font-black tabular-nums ${!homeWin ? "text-[#2563EB]" : "text-[#1A1D23]"}`}>{record.awayScore}</span>
            <span className="text-2xl font-bold text-[#D1D5DB]">-</span>
            <span className={`text-5xl font-black tabular-nums ${homeWin ? "text-[#2563EB]" : "text-[#1A1D23]"}`}>{record.homeScore}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black text-white" style={{ backgroundColor: record.homeColor }}>{record.homeShort}</div>
            <span className="text-[10px] font-bold text-[#6B7280]">{record.homeTeam}</span>
            {homeWin && <span className="rounded-md bg-[#2563EB] px-2 py-0.5 text-[8px] font-black text-white">WIN</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] bg-white">
        {([{ key: "score" as const, label: "スコア" }, { key: "batting" as const, label: "打撃成績" }, { key: "pitching" as const, label: "投手成績" }]).map((tab) => (
          <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-center text-xs font-black transition-colors ${
              activeTab === tab.key ? "border-b-2 border-[#2563EB] text-[#2563EB]" : "text-[#9CA3AF]"
            }`}>{tab.label}</button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-3">
        {activeTab === "score" && (
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
            <table className="w-full min-w-[340px] border-collapse text-center">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 w-10 border-b border-r border-[#F3F4F6] bg-[#F8F9FB] py-2 text-[9px] text-[#9CA3AF]">{"チーム"}</th>
                  {innings.map((i) => (<th key={i} className="border-b border-r border-[#F3F4F6] bg-[#F8F9FB] py-2 text-[9px] text-[#9CA3AF]">{i + 1}</th>))}
                  <th className="border-b border-r border-[#F3F4F6] bg-[#F8F9FB] py-2 text-[9px] font-bold text-[#2563EB]">R</th>
                  <th className="border-b border-r border-[#F3F4F6] bg-[#F8F9FB] py-2 text-[9px] text-[#9CA3AF]">H</th>
                  <th className="border-b border-[#F3F4F6] bg-[#F8F9FB] py-2 text-[9px] text-[#9CA3AF]">E</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="sticky left-0 z-10 border-b border-r border-[#F3F4F6] bg-white py-2 text-[9px] font-black" style={{ color: record.awayColor }}>{record.awayShort}</td>
                  {innings.map((i) => (<td key={i} className="border-b border-r border-[#F3F4F6] py-2 text-[10px] tabular-nums text-[#374151]">{record.innings.away[i] ?? ""}</td>))}
                  <td className="border-b border-r border-[#F3F4F6] py-2 text-[11px] font-black tabular-nums text-[#2563EB]">{record.awayScore}</td>
                  <td className="border-b border-r border-[#F3F4F6] py-2 text-[10px] tabular-nums text-[#374151]">{record.awayHits}</td>
                  <td className="border-b border-[#F3F4F6] py-2 text-[10px] tabular-nums text-[#DC2626]">{record.awayErrors}</td>
                </tr>
                <tr>
                  <td className="sticky left-0 z-10 border-r border-[#F3F4F6] bg-white py-2 text-[9px] font-black" style={{ color: record.homeColor }}>{record.homeShort}</td>
                  {innings.map((i) => (<td key={i} className="border-r border-[#F3F4F6] py-2 text-[10px] tabular-nums text-[#374151]">{record.innings.home[i] ?? ""}</td>))}
                  <td className="border-r border-[#F3F4F6] py-2 text-[11px] font-black tabular-nums text-[#2563EB]">{record.homeScore}</td>
                  <td className="border-r border-[#F3F4F6] py-2 text-[10px] tabular-nums text-[#374151]">{record.homeHits}</td>
                  <td className="py-2 text-[10px] tabular-nums text-[#DC2626]">{record.homeErrors}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "batting" && (
          <div className="flex flex-col gap-4">
            <BattingTable label={record.awayTeam} color={record.awayColor} players={record.awayLineup} />
            <BattingTable label={record.homeTeam} color={record.homeColor} players={record.homeLineup} />
          </div>
        )}

        {activeTab === "pitching" && (
          <div className="flex flex-col gap-4">
            <PitchingTable label={record.awayTeam} color={record.awayColor} pitchers={record.awayPitchers} />
            <PitchingTable label={record.homeTeam} color={record.homeColor} pitchers={record.homePitchers} />
          </div>
        )}
      </div>
    </div>
  );
}

function BattingTable({ label, color, players }: { label: string; color: string; players: { name: string; pos: string; atBats: number; hits: number; rbi: number; avg: number }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="border-b border-[#F3F4F6] bg-[#F8F9FB] px-3 py-2"><span className="text-xs font-black" style={{ color }}>{label}</span></div>
      <table className="w-full border-collapse text-center">
        <thead><tr>
          <th className="border-b border-r border-[#F3F4F6] py-1.5 pl-3 text-left text-[8px] text-[#9CA3AF]">{"打順"}</th>
          <th className="border-b border-r border-[#F3F4F6] py-1.5 text-[8px] text-[#9CA3AF]">{"守"}</th>
          <th className="border-b border-r border-[#F3F4F6] py-1.5 text-left text-[8px] text-[#9CA3AF]">{"選手名"}</th>
          <th className="border-b border-r border-[#F3F4F6] py-1.5 text-[8px] text-[#9CA3AF]">{"打数"}</th>
          <th className="border-b border-r border-[#F3F4F6] py-1.5 text-[8px] text-[#9CA3AF]">{"安打"}</th>
          <th className="border-b border-r border-[#F3F4F6] py-1.5 text-[8px] text-[#9CA3AF]">{"打点"}</th>
          <th className="border-b border-[#F3F4F6] py-1.5 text-[8px] text-[#9CA3AF]">{"打率"}</th>
        </tr></thead>
        <tbody>{players.map((p, i) => (
          <tr key={`${p.name}-${i}`}>
            <td className={`border-r border-[#F3F4F6] py-1.5 pl-3 text-left text-[10px] font-bold text-[#2563EB] ${i < players.length - 1 ? "border-b" : ""}`}>{i + 1}</td>
            <td className={`border-r border-[#F3F4F6] py-1.5 text-[10px] font-bold text-[#6B7280] ${i < players.length - 1 ? "border-b" : ""}`}>{p.pos}</td>
            <td className={`border-r border-[#F3F4F6] py-1.5 pl-2 text-left text-[10px] font-bold text-[#1A1D23] ${i < players.length - 1 ? "border-b" : ""}`}>{p.name}</td>
            <td className={`border-r border-[#F3F4F6] py-1.5 text-[10px] tabular-nums text-[#374151] ${i < players.length - 1 ? "border-b" : ""}`}>{p.atBats}</td>
            <td className={`border-r border-[#F3F4F6] py-1.5 text-[10px] tabular-nums font-bold ${p.hits > 0 ? "text-[#16A34A]" : "text-[#374151]"} ${i < players.length - 1 ? "border-b" : ""}`}>{p.hits}</td>
            <td className={`border-r border-[#F3F4F6] py-1.5 text-[10px] tabular-nums font-bold ${p.rbi > 0 ? "text-[#D97706]" : "text-[#374151]"} ${i < players.length - 1 ? "border-b" : ""}`}>{p.rbi}</td>
            <td className={`py-1.5 text-[10px] tabular-nums text-[#6B7280] ${i < players.length - 1 ? "border-b border-[#F3F4F6]" : ""}`}>{formatAvg(p.avg)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function PitchingTable({ label, color, pitchers }: { label: string; color: string; pitchers: { name: string; ip: number; hits: number; er: number; so: number; bb: number; result: string }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="border-b border-[#F3F4F6] bg-[#F8F9FB] px-3 py-2"><span className="text-xs font-black" style={{ color }}>{label}</span></div>
      <table className="w-full border-collapse text-center">
        <thead><tr>
          <th className="border-b border-r border-[#F3F4F6] py-1.5 pl-3 text-left text-[8px] text-[#9CA3AF]">{"投手名"}</th>
          <th className="border-b border-r border-[#F3F4F6] py-1.5 text-[8px] text-[#9CA3AF]">{"結果"}</th>
          <th className="border-b border-r border-[#F3F4F6] py-1.5 text-[8px] text-[#9CA3AF]">{"投球回"}</th>
          <th className="border-b border-r border-[#F3F4F6] py-1.5 text-[8px] text-[#9CA3AF]">{"被安"}</th>
          <th className="border-b border-r border-[#F3F4F6] py-1.5 text-[8px] text-[#9CA3AF]">{"自責"}</th>
          <th className="border-b border-r border-[#F3F4F6] py-1.5 text-[8px] text-[#9CA3AF]">{"奪三"}</th>
          <th className="border-b border-[#F3F4F6] py-1.5 text-[8px] text-[#9CA3AF]">{"四球"}</th>
        </tr></thead>
        <tbody>{pitchers.map((p, i) => (
          <tr key={`${p.name}-${i}`}>
            <td className={`border-r border-[#F3F4F6] py-1.5 pl-3 text-left text-[10px] font-bold text-[#1A1D23] ${i < pitchers.length - 1 ? "border-b" : ""}`}>{p.name}</td>
            <td className={`border-r border-[#F3F4F6] py-1.5 text-[10px] font-black ${p.result === "W" ? "text-[#16A34A]" : p.result === "L" ? "text-[#DC2626]" : "text-[#9CA3AF]"} ${i < pitchers.length - 1 ? "border-b" : ""}`}>{p.result}</td>
            <td className={`border-r border-[#F3F4F6] py-1.5 text-[10px] tabular-nums text-[#374151] ${i < pitchers.length - 1 ? "border-b" : ""}`}>{p.ip}</td>
            <td className={`border-r border-[#F3F4F6] py-1.5 text-[10px] tabular-nums text-[#374151] ${i < pitchers.length - 1 ? "border-b" : ""}`}>{p.hits}</td>
            <td className={`border-r border-[#F3F4F6] py-1.5 text-[10px] tabular-nums ${p.er > 0 ? "text-[#DC2626]" : "text-[#374151]"} ${i < pitchers.length - 1 ? "border-b" : ""}`}>{p.er}</td>
            <td className={`border-r border-[#F3F4F6] py-1.5 text-[10px] tabular-nums font-bold text-[#D97706] ${i < pitchers.length - 1 ? "border-b" : ""}`}>{p.so}</td>
            <td className={`py-1.5 text-[10px] tabular-nums text-[#374151] ${i < pitchers.length - 1 ? "border-b border-[#F3F4F6]" : ""}`}>{p.bb}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
