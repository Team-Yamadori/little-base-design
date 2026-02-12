"use client";

import { useAppContext } from "@/lib/store";
import { useState } from "react";

export function TeamSelectScreen() {
  const { navigate } = useAppContext();
  const [teamCode, setTeamCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleJoin = () => {
    if (teamCode.trim().length > 0) {
      navigate("home");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8F9FB]">
      {/* Header */}
      <div className="flex flex-col items-center px-4 pb-4 pt-10">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2563EB] shadow-md">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h1 className="text-lg font-black text-[#1A1D23]">
          {"チームを選択"}
        </h1>
        <p className="mt-1.5 text-center text-xs text-[#6B7280]">
          {"新しくチームを作るか、既存チームに参加しましょう"}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 pt-4">
        {/* Create Team */}
        <button
          type="button"
          onClick={() => navigate("team-create")}
          className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-5 text-left shadow-sm transition-all active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-[#1A1D23]">
              {"チームを作成"}
            </p>
            <p className="mt-0.5 text-[10px] text-[#6B7280]">
              {"新しいチームを作って選手を登録"}
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Join Team */}
        <button
          type="button"
          onClick={() => setShowJoinInput(!showJoinInput)}
          className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-5 text-left shadow-sm transition-all active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-[#1A1D23]">
              {"チームに参加"}
            </p>
            <p className="mt-0.5 text-[10px] text-[#6B7280]">
              {"チームコードで既存チームに参加"}
            </p>
          </div>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform ${showJoinInput ? "rotate-90" : ""}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Join input */}
        {showJoinInput && (
          <div className="animate-[slideUp_0.15s_ease-out] rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm">
            <label className="mb-2 block text-[10px] font-bold text-[#6B7280]" htmlFor="team-code">
              {"チームコード"}
            </label>
            <input
              id="team-code"
              type="text"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              placeholder="例: ABC123"
              maxLength={8}
              className="mb-3 w-full rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] px-4 py-3 text-center text-base font-bold tracking-widest text-[#1A1D23] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              autoFocus
            />
            <button
              type="button"
              onClick={handleJoin}
              disabled={teamCode.trim().length === 0}
              className="w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-30"
            >
              {"参加する"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-6 pt-4">
        <p className="text-center text-[10px] text-[#9CA3AF]">
          {"チーム作成後、メンバーを招待できます"}
        </p>
      </div>
    </div>
  );
}
