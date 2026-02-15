"use client";

import { useGame } from "@/hooks/use-game";
import { BaseDiamond } from "./base-diamond";
import { CountDisplay } from "./count-display";
import { GameControls } from "./game-controls";
import { InningBoard } from "./inning-board";
import { PlayerInfo } from "./player-info";
import { RunnerResolution } from "./runner-resolution";

export function Scoreboard() {
  const {
    gameState,
    message,
    playSeq,
    pendingPlay,
    handleAction,
    updatePendingSlot,
    cancelPending,
    confirmPending,
  } = useGame();

  return (
    <div className="relative flex w-full flex-col">
      {/* Top HUD: Inning + Score Summary */}
      <div className="flex items-stretch border-b border-[hsl(210,50%,25%)] bg-[hsl(210,70%,8%)]">
        {/* Inning */}
        <div className="flex items-center gap-1 border-r border-[hsl(210,50%,25%)] px-3 py-2">
          <div className="flex flex-col items-center leading-none">
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              className={gameState.isTop ? "opacity-100" : "opacity-20"}
              aria-hidden="true"
            >
              <polygon
                points="5,0 10,6 0,6"
                fill={gameState.isTop ? "hsl(38, 100%, 50%)" : "hsl(210, 30%, 40%)"}
              />
            </svg>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              className={`mt-0.5 ${!gameState.isTop ? "opacity-100" : "opacity-20"}`}
              aria-hidden="true"
            >
              <polygon
                points="5,6 10,0 0,0"
                fill={!gameState.isTop ? "hsl(38, 100%, 50%)" : "hsl(210, 30%, 40%)"}
              />
            </svg>
          </div>
          <span className="text-xl font-black text-[hsl(38,100%,50%)]">
            {gameState.inning}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-1 items-center justify-center gap-4 px-3">
          <div className="flex items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-[hsl(0,0%,100%)] ${gameState.isTop ? "bg-[hsl(0,75%,45%)]" : "bg-[hsl(0,75%,45%)]/60"}`}
            >
              {gameState.away.shortName}
            </span>
            <span className="text-2xl font-black tabular-nums text-[hsl(48,100%,96%)]">
              {gameState.away.runs}
            </span>
          </div>
          <span className="text-sm font-bold text-[hsl(210,20%,40%)]">-</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tabular-nums text-[hsl(48,100%,96%)]">
              {gameState.home.runs}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-[hsl(0,0%,100%)] ${!gameState.isTop ? "bg-[hsl(210,80%,40%)]" : "bg-[hsl(210,80%,40%)]/60"}`}
            >
              {gameState.home.shortName}
            </span>
          </div>
        </div>

        {/* Mini Diamond */}
        <div className="flex items-center border-l border-[hsl(210,50%,25%)] px-3">
          <BaseDiamond bases={gameState.bases} size="sm" />
        </div>
      </div>

      {/* BSO Count */}
      <CountDisplay
        balls={gameState.balls}
        strikes={gameState.strikes}
        outs={gameState.outs}
      />

      {/* Player Info */}
      <PlayerInfo
        batter={gameState.currentBatter}
        pitcher={gameState.currentPitcher}
      />

      {/* Inning Score Grid */}
      <InningBoard
        home={gameState.home}
        away={gameState.away}
        currentInning={gameState.inning}
        isTop={gameState.isTop}
      />

      {/* Large Diamond */}
      <div className="flex items-center justify-center bg-[hsl(210,60%,7%)] py-4">
        <BaseDiamond bases={gameState.bases} size="lg" />
      </div>

      {/* Controls */}
      <GameControls key={playSeq} gameState={gameState} onAction={handleAction} />

      {/* Runner Resolution Sheet */}
      {pendingPlay && (
        <RunnerResolution
          play={pendingPlay}
          onUpdate={updatePendingSlot}
          onCancel={cancelPending}
          onConfirm={confirmPending}
        />
      )}

      {/* Message Overlay */}
      {message && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="animate-bounce rounded-2xl border-4 border-[hsl(38,100%,50%)] bg-[hsl(210,80%,8%)] px-8 py-4 shadow-[0_0_60px_hsl(38,100%,50%,0.5)]">
            <span className="text-2xl font-black text-[hsl(38,100%,50%)]">
              {message}
            </span>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-[hsl(210,80%,4%)]/80">
          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl font-black text-[hsl(38,100%,50%)]">
              GAME SET
            </span>
            <div className="flex items-center gap-4 text-xl font-black text-[hsl(48,100%,96%)]">
              <span>
                {gameState.away.shortName} {gameState.away.runs}
              </span>
              <span className="text-[hsl(210,20%,40%)]">-</span>
              <span>
                {gameState.home.runs} {gameState.home.shortName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleAction("reset")}
              className="pointer-events-auto mt-2 rounded-xl bg-[hsl(38,100%,50%)] px-8 py-3 text-sm font-black text-[hsl(210,80%,8%)] active:scale-95"
            >
              NEW GAME
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
