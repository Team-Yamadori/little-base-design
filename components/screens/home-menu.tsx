"use client";

import { useAppContext } from "@/lib/store";
import { createRandomOpponent, POSITION_SHORT, getPlayer } from "@/lib/team-data";
import { Swords, Play } from "lucide-react";

export function HomeMenu() {
  const { state, navigate, setOpponent } = useAppContext();
  const { myTeam, activeGameState } = state;

  const starterPreview = myTeam.lineup.slice(0, 4).map((slot, i) => {
    const p = getPlayer(myTeam, slot.playerId);
    return { order: i + 1, pos: POSITION_SHORT[slot.fieldPosition], name: p?.name ?? "-" };
  });

  const handleNewGame = () => {
    setOpponent(createRandomOpponent());
    navigate("game-setup");
  };

  const handleResumeGame = () => {
    navigate("game");
  };

  const hasLiveGame = activeGameState && !activeGameState.isGameOver;

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8F9FB] pb-16">
      {/* Header */}
      <div className="flex flex-col items-center px-4 pb-3 pt-6">
        <div className="mb-0.5 text-[9px] font-bold tracking-[0.3em] text-[#2563EB]">
          KYONO GROUND
        </div>
        <h1 className="text-lg font-black text-[#1A1D23]">
          {"スコアブック"}
        </h1>
      </div>

      {/* Active Game Card */}
      {hasLiveGame ? (
        <div className="mx-4 mb-3">
          <button
            type="button"
            onClick={handleResumeGame}
            className="w-full overflow-hidden rounded-xl border border-[#FCA5A5] bg-white shadow-sm transition-all active:scale-[0.98]"
          >
            {/* Live badge */}
            <div className="flex items-center justify-between border-b border-[#FEE2E2] px-3 py-1.5">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#DC2626] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#DC2626]" />
                </span>
                <span className="text-[10px] font-black text-[#DC2626]">LIVE</span>
              </div>
              <span className="text-[10px] font-bold text-[#6B7280]">
                {activeGameState!.isTop ? "表" : "裏"} {activeGameState!.inning}{"回"}
              </span>
              <div className="flex items-center gap-1 text-[#DC2626]">
                <Play size={10} fill="currentColor" />
                <span className="text-[10px] font-black">{"続きから"}</span>
              </div>
            </div>

            {/* Score display */}
            <div className="flex items-center justify-center gap-4 px-4 py-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded text-[9px] font-black text-white"
                  style={{ backgroundColor: activeGameState!.away.color }}
                >
                  {activeGameState!.away.shortName}
                </div>
                <span className="text-2xl font-black tabular-nums text-[#1A1D23]">
                  {activeGameState!.away.runs}
                </span>
              </div>
              <span className="text-sm font-bold text-[#D1D5DB]">-</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tabular-nums text-[#1A1D23]">
                  {activeGameState!.home.runs}
                </span>
                <div
                  className="flex h-7 w-7 items-center justify-center rounded text-[9px] font-black text-white"
                  style={{ backgroundColor: activeGameState!.home.color }}
                >
                  {activeGameState!.home.shortName}
                </div>
              </div>
            </div>

            {/* Count/Outs mini */}
            <div className="flex items-center justify-center gap-4 border-t border-[#FEE2E2] px-3 py-1.5">
              <span className="text-[9px] text-[#6B7280]">
                B{activeGameState!.balls} S{activeGameState!.strikes} O{activeGameState!.outs}
              </span>
              <span className="text-[9px] text-[#6B7280]">
                {"塁:"}{" "}
                {[
                  activeGameState!.bases[0] ? "1" : "",
                  activeGameState!.bases[1] ? "2" : "",
                  activeGameState!.bases[2] ? "3" : "",
                ]
                  .filter(Boolean)
                  .join(",") || "なし"}
              </span>
            </div>
          </button>
        </div>
      ) : null}

      {/* My Team Card */}
      <div className="mx-4 mb-3 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#F3F4F6] px-4 py-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white"
            style={{ backgroundColor: myTeam.color }}
          >
            {myTeam.shortName}
          </div>
          <div className="flex-1">
            <span className="text-sm font-black text-[#1A1D23]">{myTeam.name}</span>
            <span className="ml-2 text-[10px] text-[#9CA3AF]">
              {myTeam.players.length}{"名"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-0">
          {starterPreview.map((s) => (
            <div key={s.order} className="flex flex-col items-center border-r border-[#F3F4F6] py-2 last:border-r-0">
              <span className="text-[8px] font-bold text-[#2563EB]">
                {s.order}{"番"} {s.pos}
              </span>
              <span className="text-[10px] font-bold text-[#1A1D23]">
                {s.name.split(" ").pop()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* New Game Button */}
      <div className="px-4">
        <button
          type="button"
          onClick={handleNewGame}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-3.5 shadow-md transition-all active:scale-[0.98]"
        >
          <Swords size={18} className="text-white" />
          <span className="text-sm font-black text-white">{"新しい試合を始める"}</span>
        </button>
      </div>

      <div className="mt-auto flex items-center justify-center pb-3">
        <span className="text-[9px] text-[#D1D5DB]">v5.0</span>
      </div>
    </div>
  );
}
