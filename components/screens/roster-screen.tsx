"use client";

import { useAppContext } from "@/lib/store";
import { POSITION_SHORT, formatAvg, formatEra, type Player, type Position } from "@/lib/team-data";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-[#E5E7EB] bg-[#F8F9FB] py-2">
      <span className="text-[9px] font-bold text-[#9CA3AF]">{label}</span>
      <span className="text-base font-black tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}

function PlayerDetailModal({ player, onClose, onUpdate, onDelete, canDelete }: {
  player: Player; onClose: () => void; onUpdate: (id: string, updates: Partial<Player>) => void; onDelete: (id: string) => void; canDelete: boolean;
}) {
  const isPitcher = player.position === "投手";
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-[#F3F4F6] px-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <span className="text-lg font-black text-[#2563EB]">{POSITION_SHORT[player.position]}</span>
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold tabular-nums text-[#2563EB]">#{player.number}</span>
              <span className="text-lg font-black text-[#1A1D23]">{player.name}</span>
            </div>
            <span className="text-[10px] text-[#9CA3AF]">
              {player.position}
              {player.subPositions && player.subPositions.length > 0 ? ` / ${player.subPositions.map((p) => POSITION_SHORT[p]).join("・")}` : ""}
            </span>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg bg-[#F3F4F6] px-3 py-1.5 text-[10px] font-bold text-[#6B7280] active:scale-95">{"閉じる"}</button>
        </div>

        <div className="flex items-center gap-3 border-b border-[#F3F4F6] px-4 py-3">
          <span className="text-[10px] font-bold text-[#9CA3AF]">{"名前"}</span>
          <input type="text" value={player.name} onChange={(e) => onUpdate(player.id, { name: e.target.value })} maxLength={10}
            className="flex-1 rounded-lg border border-[#E5E7EB] bg-[#F8F9FB] px-3 py-2 text-sm font-bold text-[#1A1D23] outline-none focus:border-[#2563EB]" />
        </div>

        <div className="flex items-center gap-3 border-b border-[#F3F4F6] px-4 py-3">
          <span className="text-[10px] font-bold text-[#9CA3AF]">{"背番号"}</span>
          <select value={player.number} onChange={(e) => onUpdate(player.id, { number: Number(e.target.value) })}
            className="rounded-lg bg-[#F8F9FB] px-3 py-2 text-sm font-black tabular-nums text-[#2563EB] outline-none">
            {Array.from({ length: 100 }, (_, i) => (<option key={i} value={i}>{i}</option>))}
          </select>
        </div>

        <div className="px-4 py-3">
          <div className="mb-2 text-[10px] font-black tracking-wider text-[#2563EB]">{isPitcher ? "PITCHING STATS" : "BATTING STATS"}</div>
          {isPitcher ? (
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="防御率" value={formatEra(player.era ?? 0)} color="#D97706" />
              <StatBox label="勝" value={String(player.wins ?? 0)} color="#16A34A" />
              <StatBox label="敗" value={String(player.losses ?? 0)} color="#DC2626" />
              <StatBox label="S" value={String(player.saves ?? 0)} color="#0891B2" />
              <StatBox label="H" value={String(player.holds ?? 0)} color="#2563EB" />
              <StatBox label="登板" value={String(player.games ?? 0)} color="#6B7280" />
              <StatBox label="奪三振" value={String(player.strikeouts ?? 0)} color="#DC2626" />
              <StatBox label="与四球" value={String(player.pitchWalks ?? 0)} color="#6B7280" />
              <StatBox label="投球回" value={String(player.inningsPitched ?? 0)} color="#6B7280" />
              <StatBox label="被安打" value={String(player.hitsAllowed ?? 0)} color="#D97706" />
              <StatBox label="WHIP" value={String(player.whip?.toFixed(2) ?? "-")} color="#7C3AED" />
              <StatBox label="完封" value={String(player.shutouts ?? 0)} color="#D97706" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="打率" value={formatAvg(player.avg)} color="#16A34A" />
              <StatBox label="本塁打" value={String(player.hr)} color="#D97706" />
              <StatBox label="打点" value={String(player.rbi)} color="#DC2626" />
              <StatBox label="安打" value={String(player.hits)} color="#2563EB" />
              <StatBox label="打数" value={String(player.atBats)} color="#6B7280" />
              <StatBox label="得点" value={String(player.runs)} color="#0891B2" />
              <StatBox label="盗塁" value={String(player.stolenBases)} color="#16A34A" />
              <StatBox label="四球" value={String(player.walks)} color="#6B7280" />
              <StatBox label="三振" value={String(player.strikeoutsBatting)} color="#DC2626" />
              <StatBox label="二塁打" value={String(player.doubles)} color="#D97706" />
              <StatBox label="出塁率" value={player.obp.toFixed(3).replace(/^0/, "")} color="#2563EB" />
              <StatBox label="長打率" value={player.slg.toFixed(3).replace(/^0/, "")} color="#7C3AED" />
            </div>
          )}
        </div>

        <div className="border-t border-[#F3F4F6] px-4 py-3">
          {!confirmDelete ? (
            <button type="button" onClick={() => { if (canDelete) setConfirmDelete(true); }} disabled={!canDelete}
              className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-[11px] font-bold active:scale-95 ${
                canDelete ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F3F4F6] text-[#D1D5DB]"
              }`}>
              <Trash2 size={12} />{canDelete ? "この選手を削除" : "スタメンは削除できません"}
            </button>
          ) : (
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 rounded-lg bg-[#F3F4F6] py-2.5 text-[11px] font-bold text-[#6B7280] active:scale-95">{"キャンセル"}</button>
              <button type="button" onClick={() => { onDelete(player.id); onClose(); }} className="flex-1 rounded-lg bg-[#DC2626] py-2.5 text-[11px] font-bold text-white active:scale-95">{"削除する"}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function createNewPlayer(existingNumbers: number[]): Player {
  const usedSet = new Set(existingNumbers);
  let num = 0;
  for (let i = 1; i < 100; i++) { if (!usedSet.has(i)) { num = i; break; } }
  return { id: `p-${Date.now()}`, name: "新規選手", number: num, position: "右翼" as Position, avg: 0.200, hr: 0, rbi: 0, hits: 0, atBats: 0, runs: 0, stolenBases: 0, obp: 0.200, slg: 0.200, walks: 0, strikeoutsBatting: 0, doubles: 0, triples: 0, sacrificeBunts: 0, sacrificeFlies: 0 };
}

export function RosterScreen() {
  const { state, navigate, goBack, updateMyTeam } = useAppContext();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const team = state.myTeam;
  const lineupPlayerIds = new Set(team.lineup.map((s) => s.playerId));

  const handleUpdate = (playerId: string, updates: Partial<Player>) => {
    updateMyTeam((t) => ({ ...t, players: t.players.map((p) => p.id === playerId ? { ...p, ...updates } : p) }));
    setSelectedPlayer((prev) => prev && prev.id === playerId ? { ...prev, ...updates } : prev);
  };

  const handleDelete = (playerId: string) => {
    updateMyTeam((t) => ({ ...t, players: t.players.filter((p) => p.id !== playerId), benchPlayers: t.benchPlayers.filter((id) => id !== playerId), pitchingRotation: t.pitchingRotation.filter((id) => id !== playerId) }));
  };

  const handleAdd = () => {
    const newPlayer = createNewPlayer(team.players.map((p) => p.number));
    updateMyTeam((t) => ({ ...t, players: [...t.players, newPlayer], benchPlayers: [...t.benchPlayers, newPlayer.id] }));
  };

  const sorted = [...team.players].sort((a, b) => a.number - b.number);

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8F9FB] pb-16">
      <div className="flex items-center border-b border-[#E5E7EB] bg-white px-3 py-3">
        <button type="button" onClick={goBack} className="flex items-center gap-1 text-[#6B7280] active:opacity-70">
          <ArrowLeft size={18} /><span className="text-xs font-bold">{"戻る"}</span>
        </button>
        <h2 className="flex-1 text-center text-sm font-black text-[#1A1D23]">{"選手一覧"} - {team.name}</h2>
        <div className="w-12" />
      </div>

      <div className="flex items-center gap-1.5 bg-[#F3F4F6] px-4 py-2">
        <span className="w-7 text-[8px] font-bold text-[#9CA3AF]">{"背番"}</span>
        <span className="w-5 text-center text-[8px] font-bold text-[#9CA3AF]">{"守"}</span>
        <span className="flex-1 text-[8px] font-bold text-[#9CA3AF]">{"選手名"}</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {sorted.map((player, i) => (
          <button key={player.id} type="button" onClick={() => setSelectedPlayer(player)}
            className={`flex items-center gap-1.5 bg-white px-4 py-2.5 active:bg-[#F3F4F6] ${i < sorted.length - 1 ? "border-b border-[#F3F4F6]" : ""}`}>
            <span className="w-7 text-[10px] font-bold tabular-nums text-[#2563EB]">#{player.number}</span>
            <span className="w-5 text-center text-[10px] font-bold text-[#6B7280]">{POSITION_SHORT[player.position]}</span>
            <span className="flex-1 text-left text-[11px] font-bold text-[#1A1D23]">{player.name}</span>
          </button>
        ))}
        <button type="button" onClick={handleAdd} className="flex items-center justify-center gap-1.5 border-t border-[#F3F4F6] bg-white px-4 py-3 active:bg-[#F3F4F6]">
          <Plus size={14} className="text-[#2563EB]" /><span className="text-[11px] font-bold text-[#2563EB]">{"選手を追加"}</span>
        </button>
      </div>

      {selectedPlayer && (
        <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} onUpdate={handleUpdate} onDelete={handleDelete} canDelete={!lineupPlayerIds.has(selectedPlayer.id)} />
      )}
    </div>
  );
}
