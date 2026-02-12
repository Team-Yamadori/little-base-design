"use client";

import { useAppContext } from "@/lib/store";
import { ArrowLeft, Trophy, ChevronRight } from "lucide-react";

export function ScoreHistoryScreen() {
  const { state, navigate, goBack, setSelectedGameId } = useAppContext();
  const records = [...state.gameRecords].reverse();

  const handleViewDetail = (id: string) => { setSelectedGameId(id); navigate("game-detail"); };

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8F9FB] pb-16">
      <div className="flex items-center border-b border-[#E5E7EB] bg-white px-3 py-3">
        <button type="button" onClick={goBack} className="flex items-center gap-1 text-[#6B7280] active:opacity-70">
          <ArrowLeft size={18} /><span className="text-xs font-bold">{"戻る"}</span>
        </button>
        <h2 className="flex-1 text-center text-sm font-black text-[#1A1D23]">{"試合結果"}</h2>
        <div className="w-12" />
      </div>

      {records.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F4F6]">
            <Trophy size={28} className="text-[#D1D5DB]" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-black text-[#1A1D23]">{"まだ試合結果がありません"}</span>
            <span className="text-[10px] text-[#9CA3AF]">{"試合を行うとここに結果が表示されます"}</span>
          </div>
          <button type="button" onClick={() => navigate("game-setup")}
            className="mt-2 rounded-xl bg-[#2563EB] px-8 py-3 text-sm font-black text-white shadow-md active:scale-[0.98]">
            {"試合を始める"}
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 px-4 py-4">
          {records.map((record) => {
            const homeWin = record.homeScore > record.awayScore;
            const innings = Array.from({ length: Math.max(9, record.innings.away.length) }, (_, i) => i);
            return (
              <button key={record.id} type="button" onClick={() => handleViewDetail(record.id)}
                className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white text-left shadow-sm transition-all active:scale-[0.99]">
                <div className="flex items-center justify-between border-b border-[#F3F4F6] bg-[#F8F9FB] px-4 py-2">
                  <span className="text-[10px] text-[#9CA3AF]">{record.date}</span>
                  <div className="flex items-center gap-0.5 text-[10px] text-[#2563EB]">
                    <span className="font-bold">{"詳細"}</span><ChevronRight size={12} />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-5 px-4 py-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-black text-white" style={{ backgroundColor: record.awayColor }}>{record.awayShort}</div>
                    <span className="text-[10px] font-bold text-[#6B7280]">{record.awayTeam}</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className={`text-3xl font-black tabular-nums ${!homeWin ? "text-[#2563EB]" : "text-[#1A1D23]"}`}>{record.awayScore}</span>
                    <span className="text-lg font-bold text-[#D1D5DB]">-</span>
                    <span className={`text-3xl font-black tabular-nums ${homeWin ? "text-[#2563EB]" : "text-[#1A1D23]"}`}>{record.homeScore}</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-black text-white" style={{ backgroundColor: record.homeColor }}>{record.homeShort}</div>
                    <span className="text-[10px] font-bold text-[#6B7280]">{record.homeTeam}</span>
                  </div>
                </div>
                <div className="border-t border-[#F3F4F6]">
                  <table className="w-full border-collapse text-center">
                    <thead>
                      <tr>
                        <th className="w-7 border-b border-r border-[#F3F4F6] py-1 text-[7px] text-[#9CA3AF]" />
                        {innings.map((i) => (<th key={i} className="border-b border-r border-[#F3F4F6] py-1 text-[7px] text-[#9CA3AF]">{i + 1}</th>))}
                        <th className="w-5 border-b border-r border-[#F3F4F6] py-1 text-[7px] font-bold text-[#2563EB]">R</th>
                        <th className="w-5 border-b border-r border-[#F3F4F6] py-1 text-[7px] text-[#9CA3AF]">H</th>
                        <th className="w-5 border-b border-[#F3F4F6] py-1 text-[7px] text-[#9CA3AF]">E</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-b border-r border-[#F3F4F6] py-1 text-[7px] font-bold" style={{ color: record.awayColor }}>{record.awayShort}</td>
                        {innings.map((i) => (<td key={i} className="border-b border-r border-[#F3F4F6] py-1 text-[8px] tabular-nums text-[#374151]">{record.innings.away[i] ?? ""}</td>))}
                        <td className="border-b border-r border-[#F3F4F6] py-1 text-[9px] font-black tabular-nums text-[#2563EB]">{record.awayScore}</td>
                        <td className="border-b border-r border-[#F3F4F6] py-1 text-[8px] tabular-nums text-[#374151]">{record.awayHits}</td>
                        <td className="border-b border-[#F3F4F6] py-1 text-[8px] tabular-nums text-[#DC2626]">{record.awayErrors}</td>
                      </tr>
                      <tr>
                        <td className="border-r border-[#F3F4F6] py-1 text-[7px] font-bold" style={{ color: record.homeColor }}>{record.homeShort}</td>
                        {innings.map((i) => (<td key={i} className="border-r border-[#F3F4F6] py-1 text-[8px] tabular-nums text-[#374151]">{record.innings.home[i] ?? ""}</td>))}
                        <td className="border-r border-[#F3F4F6] py-1 text-[9px] font-black tabular-nums text-[#2563EB]">{record.homeScore}</td>
                        <td className="border-r border-[#F3F4F6] py-1 text-[8px] tabular-nums text-[#374151]">{record.homeHits}</td>
                        <td className="py-1 text-[8px] tabular-nums text-[#DC2626]">{record.homeErrors}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
