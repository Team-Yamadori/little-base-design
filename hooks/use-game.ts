"use client";

import { useCallback, useState } from "react";
import {
  type ComplexAction,
  type Destination,
  type GameAction,
  type GameState,
  type HitDirection,
  type HistoryEntry,
  type PendingFielding,
  type PendingPlay,
  type PlayerData,
  type RunnerSlot,
  type StrikeoutType,
  initialGameState,
} from "@/lib/game-state";

const batterNames = [
  "猪狩 守", "矢部 明雄", "六道 聖", "友沢 亮", "橘 みずき",
  "阿畑 やすし", "東條 小次郎", "冴木 創", "茂野 吾郎",
];

const ACTION_LABELS: Partial<Record<GameAction, string>> = {
  ball: "ボール", strike: "ストライク", foul: "ファウル",
  homerun: "ホームラン", triple: "三塁打",
  "hit-by-pitch": "死球", walk: "四球", "intentional-walk": "敬遠",
};

const DEST_ORDER: Record<Destination, number> = {
  out: -1, stay: 0, "1B": 1, "2B": 2, "3B": 3, home: 4,
};

const FROM_POS: Record<string, number> = { batter: 0, "1B": 1, "2B": 2, "3B": 3 };
const DEST_BASE: Record<string, number | null> = { "1B": 1, "2B": 2, "3B": 3, home: 4, out: null };
const BASE_TO_DEST: Record<number, Destination> = { 1: "1B", 2: "2B", 3: "3B", 4: "home" };

function getSlotBase(slot: RunnerSlot): number | null {
  if (slot.destination === "out") return null;
  return DEST_BASE[slot.destination] ?? null;
}

function cascadeSlots(slots: RunnerSlot[], fromIndex = -1): void {
  const sorted = slots
    .map((_, i) => i)
    .sort((a, b) => (FROM_POS[slots[a].from] ?? 0) - (FROM_POS[slots[b].from] ?? 0));

  const startIdx = fromIndex === -1 ? 0 : Math.max(0, sorted.indexOf(fromIndex));

  // Forward: push ahead runners forward if behind runner overtakes them
  for (let si = startIdx; si < sorted.length - 1; si++) {
    const behindBase = getSlotBase(slots[sorted[si]]);
    const aheadIdx = sorted[si + 1];
    const aheadBase = getSlotBase(slots[aheadIdx]);
    if (behindBase === null || aheadBase === null) continue;
    if (aheadBase <= behindBase) {
      slots[aheadIdx] = { ...slots[aheadIdx], destination: BASE_TO_DEST[behindBase + 1] ?? "home" };
    }
  }

  // Backward: push behind runners back if ahead runner moves behind them
  if (fromIndex !== -1) {
    for (let si = startIdx; si > 0; si--) {
      const aheadBase = getSlotBase(slots[sorted[si]]);
      const behindIdx = sorted[si - 1];
      const behindBase = getSlotBase(slots[behindIdx]);
      if (aheadBase === null || behindBase === null) continue;
      if (behindBase >= aheadBase) {
        slots[behindIdx] = { ...slots[behindIdx], destination: BASE_TO_DEST[aheadBase - 1] ?? "1B" };
      }
    }
  }
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [batterIndex, setBatterIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingPlay, setPendingPlay] = useState<PendingPlay | null>(null);
  const [strikeoutPending, setStrikeoutPending] = useState(false);
  const [pendingDirection, setPendingDirection] = useState<{ action: GameAction; label: string } | null>(null);
  const [pendingFielding, setPendingFielding] = useState<PendingFielding | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [undoConfirmPending, setUndoConfirmPending] = useState(false);
  const [playSeq, setPlaySeq] = useState(0);

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 1800);
  }, []);

  const nextBatter = useCallback((): PlayerData => {
    let idx = 0;
    setBatterIndex((prev) => {
      idx = (prev + 1) % batterNames.length;
      return idx;
    });
    return {
      name: batterNames[(batterIndex + 1) % batterNames.length],
      number: ((batterIndex + 1) % batterNames.length) + 1,
      position: "野手",
      avg: `.${Math.floor(Math.random() * 200 + 200)}`,
    };
  }, [batterIndex]);

  // --- History helpers ---
  const pushHistory = useCallback((label: string) => {
    setHistory((prev) => [...prev, { state: gameState, batterIndex, label }]);
  }, [gameState, batterIndex]);

  const lastHistoryLabel = history.length > 0 ? history[history.length - 1].label : null;

  const requestUndo = useCallback(() => {
    if (history.length === 0) return;
    setUndoConfirmPending(true);
  }, [history.length]);

  const confirmUndo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const entry = prev[prev.length - 1];
      setGameState(entry.state);
      setBatterIndex(entry.batterIndex);
      return prev.slice(0, -1);
    });
    setUndoConfirmPending(false);
    setPendingPlay(null);
    setPendingDirection(null);
    setPendingFielding(null);
    setStrikeoutPending(false);
  }, []);

  const cancelUndo = useCallback(() => setUndoConfirmPending(false), []);

  // --- State helpers ---
  const ensureInningScore = (s: GameState): GameState => {
    const team = s.isTop ? "away" : "home";
    const d = { ...s[team] };
    const sc = [...d.scores];
    if (sc[s.inning - 1] === null) sc[s.inning - 1] = 0;
    d.scores = sc;
    return { ...s, [team]: d };
  };

  const addRuns = (s: GameState, r: number): GameState => {
    if (r <= 0) return s;
    const t = s.isTop ? "away" : "home";
    const d = { ...s[t] };
    d.runs += r;
    const sc = [...d.scores];
    sc[s.inning - 1] = (sc[s.inning - 1] || 0) + r;
    d.scores = sc;
    return { ...s, [t]: d };
  };

  const addHits = (s: GameState, h: number): GameState => {
    const t = s.isTop ? "away" : "home";
    const d = { ...s[t] }; d.hits += h;
    return { ...s, [t]: d };
  };

  const addErrors = (s: GameState, e: number): GameState => {
    const t = s.isTop ? "home" : "away";
    const d = { ...s[t] }; d.errors += e;
    return { ...s, [t]: d };
  };

  const resetCount = (s: GameState): GameState => ({ ...s, balls: 0, strikes: 0 });

  const forceAdvance = (bases: [boolean, boolean, boolean]): { newBases: [boolean, boolean, boolean]; runs: number } => {
    let runs = 0;
    const b: [boolean, boolean, boolean] = [...bases];
    if (b[0]) { if (b[1]) { if (b[2]) runs++; b[2] = true; } b[1] = true; }
    b[0] = true;
    return { newBases: b, runs };
  };

  const checkThreeOuts = useCallback((s: GameState): GameState => {
    if (s.outs < 3) return s;
    let state = ensureInningScore(s);
    if (state.isTop) {
      return { ...state, isTop: false, balls: 0, strikes: 0, outs: 0, bases: [false, false, false], currentBatter: nextBatter() };
    }
    const homeScores = [...state.home.scores];
    if (homeScores[state.inning - 1] === null) homeScores[state.inning - 1] = 0;
    state = { ...state, home: { ...state.home, scores: homeScores } };
    const next = state.inning + 1;
    if (next > 9) {
      showMessage("試合終了!");
      return { ...state, isPlaying: false, isGameOver: true };
    }
    return { ...state, inning: next, isTop: true, balls: 0, strikes: 0, outs: 0, bases: [false, false, false], currentBatter: nextBatter() };
  }, [nextBatter, showMessage]);

  // --- Build PendingPlay for complex actions ---
  const buildPendingPlay = useCallback((action: ComplexAction, state: GameState): PendingPlay | null => {
    const [r1, r2, r3] = state.bases;
    const slots: RunnerSlot[] = [];
    const hasRunners = r1 || r2 || r3;

    switch (action) {
      case "single": {
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "home", options: ["home", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "3B", options: ["3B", "home"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "2B", options: ["2B", "3B", "home"] });
        slots.push({ from: "batter", label: "打者", destination: "1B", options: ["1B"] });
        return { actionLabel: "シングルヒット", slots, isHit: true, isError: false };
      }
      case "double": {
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "home", options: ["home"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "3B", options: ["3B", "home"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "3B", options: ["3B", "home"] });
        slots.push({ from: "batter", label: "打者", destination: "2B", options: ["2B"] });
        return { actionLabel: "二塁打", slots, isHit: true, isError: false };
      }
      case "groundout": {
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "3B", options: ["3B", "home", "out"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "2B", options: ["2B", "3B", "home", "out"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "1B", options: ["1B", "2B", "3B", "home", "out"] });
        slots.push({ from: "batter", label: "打者", destination: "out", options: ["out", "1B", "2B", "3B", "home"] });
        return { actionLabel: "ゴロ", slots, isHit: false, isError: false };
      }
      case "flyout": {
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "3B", options: ["3B", "home", "out"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "2B", options: ["2B", "3B", "home", "out"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "1B", options: ["1B", "2B", "3B", "home", "out"] });
        slots.push({ from: "batter", label: "打者", destination: "out", options: ["out"] });
        return { actionLabel: "フライ", slots, isHit: false, isError: false };
      }
      case "lineout": {
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "3B", options: ["3B", "home", "out"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "2B", options: ["2B", "3B", "home", "out"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "1B", options: ["1B", "2B", "3B", "home", "out"] });
        slots.push({ from: "batter", label: "打者", destination: "out", options: ["out"] });
        return { actionLabel: "ライナー", slots, isHit: false, isError: false };
      }
      case "sacrifice-fly": {
        if (!r3) return null;
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "home", options: ["home", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "2B", options: ["2B", "3B", "home"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "1B", options: ["1B", "2B", "3B", "home"] });
        slots.push({ from: "batter", label: "打者", destination: "out", options: ["out"] });
        return { actionLabel: "犠飛", slots, isHit: false, isError: false };
      }
      case "sacrifice-bunt": {
        if (!hasRunners) return null;
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "home", options: ["home", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "3B", options: ["3B", "home"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "2B", options: ["2B", "3B"] });
        slots.push({ from: "batter", label: "打者", destination: "out", options: ["out", "1B", "2B"] });
        return { actionLabel: "犠打", slots, isHit: false, isError: false };
      }
      case "fielders-choice": {
        if (!hasRunners) return null;
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "3B", options: ["out", "home", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "3B", options: ["out", "3B", "2B"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "out", options: ["out", "2B", "3B"] });
        slots.push({ from: "batter", label: "打者", destination: "1B", options: ["1B"] });
        return { actionLabel: "フィールダーズチョイス", slots, isHit: false, isError: false };
      }
      case "stolen-base": {
        if (!hasRunners) return null;
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "3B", options: ["home", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "3B", options: ["3B", "2B"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "2B", options: ["2B", "1B"] });
        return { actionLabel: "盗塁", slots, isHit: false, isError: false, preserveCount: true };
      }
      case "caught-stealing": {
        if (!hasRunners) return null;
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "3B", options: ["out", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "2B", options: ["out", "2B"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "out", options: ["out", "1B"] });
        return { actionLabel: "盗塁失敗", slots, isHit: false, isError: false, preserveCount: true };
      }
      case "wild-pitch": {
        if (!hasRunners) return null;
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "home", options: ["home", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "3B", options: ["3B", "home"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "2B", options: ["2B", "3B"] });
        return { actionLabel: "暴投", slots, isHit: false, isError: false, preserveCount: true };
      }
      case "passed-ball": {
        if (!hasRunners) return null;
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "home", options: ["home", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "3B", options: ["3B", "home"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "2B", options: ["2B", "3B"] });
        return { actionLabel: "捕逸", slots, isHit: false, isError: false, preserveCount: true };
      }
      case "balk": {
        if (!hasRunners) return null;
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "home", options: ["home"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "3B", options: ["3B"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "2B", options: ["2B"] });
        return { actionLabel: "ボーク", slots, isHit: false, isError: false, preserveCount: true };
      }
      case "runner-out": {
        if (!hasRunners) return null;
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "3B", options: ["out", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "2B", options: ["out", "2B"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "1B", options: ["out", "1B"] });
        return { actionLabel: "走塁アウト", slots, isHit: false, isError: false, preserveCount: true };
      }
      case "error": {
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "home", options: ["home", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "3B", options: ["3B", "home"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "2B", options: ["2B", "3B", "home"] });
        slots.push({ from: "batter", label: "打者", destination: "1B", options: ["1B", "2B", "3B"] });
        return { actionLabel: "エラー", slots, isHit: false, isError: true };
      }
      case "dropped-third-strike": {
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "3B", options: ["home", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "2B", options: ["3B", "2B"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "1B", options: ["2B", "1B"] });
        slots.push({ from: "batter", label: "打者", destination: "1B", options: ["1B", "out"] });
        return { actionLabel: "振り逃げ", slots, isHit: false, isError: false };
      }
      case "catcher-interference": {
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "3B", options: ["home", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "2B", options: ["3B", "2B"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "2B", options: ["2B", "1B"] });
        slots.push({ from: "batter", label: "打者", destination: "1B", options: ["1B"] });
        return { actionLabel: "打撃妨害", slots, isHit: false, isError: false };
      }
      case "obstruction": {
        if (!hasRunners) return null;
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "3B", options: ["home", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "2B", options: ["3B", "home", "2B"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "1B", options: ["2B", "3B", "1B"] });
        return { actionLabel: "走塁妨害", slots, isHit: false, isError: false, preserveCount: true };
      }
      case "offensive-interference": {
        if (!hasRunners) return null;
        if (r3) slots.push({ from: "3B", label: "3塁走者", destination: "3B", options: ["out", "3B"] });
        if (r2) slots.push({ from: "2B", label: "2塁走者", destination: "2B", options: ["out", "2B"] });
        if (r1) slots.push({ from: "1B", label: "1塁走者", destination: "1B", options: ["out", "1B"] });
        return { actionLabel: "守備妨害", slots, isHit: false, isError: false, preserveCount: true };
      }
      default:
        return null;
    }
  }, []);

  // Apply cascade to fix conflicting initial defaults
  const buildPendingPlayCascaded = useCallback((action: ComplexAction, state: GameState): PendingPlay | null => {
    const play = buildPendingPlay(action, state);
    if (play) cascadeSlots(play.slots);
    return play;
  }, [buildPendingPlay]);

  // --- Resolve the pending play ---
  const resolvePlay = useCallback((play: PendingPlay) => {
    setGameState((prev) => {
      let s = ensureInningScore(prev);
      const newBases: [boolean, boolean, boolean] = [false, false, false];
      let runs = 0;
      let outs = s.outs;

      for (const slot of play.slots) {
        const dest = slot.destination;
        if (dest === "out") {
          outs++;
        } else if (dest === "home") {
          runs++;
        } else if (dest === "1B") {
          newBases[0] = true;
        } else if (dest === "2B") {
          newBases[1] = true;
        } else if (dest === "3B") {
          newBases[2] = true;
        } else if (dest === "stay") {
          if (slot.from === "1B") newBases[0] = true;
          if (slot.from === "2B") newBases[1] = true;
          if (slot.from === "3B") newBases[2] = true;
        }
      }

      s = addRuns(s, runs);
      if (play.isHit) s = addHits(s, 1);
      if (play.isError) s = addErrors(s, 1);


      if (play.preserveCount) {
        s = { ...s, outs, bases: newBases };
      } else {
        s = { ...resetCount(s), outs, bases: newBases, currentBatter: nextBatter() };
      }

      if (runs > 0) {
        showMessage(runs >= 2 ? `${runs}点!` : "得点!");
      } else {
        showMessage(`${play.actionLabel}!`);
      }

      if (outs >= 3) {
        showMessage("チェンジ!");
        return checkThreeOuts(s);
      }
      return s;
    });
    setPendingPlay(null);
    setPlaySeq((s) => s + 1);
  }, [nextBatter, checkThreeOuts, showMessage]);

  // --- Direction selection (for hits) ---
  const resolveDirection = useCallback((direction: HitDirection) => {
    if (!pendingDirection) return;
    const { action, label } = pendingDirection;
    setPendingDirection(null);

    // HR and triple: apply immediately
    if (action === "homerun" || action === "triple") {
      pushHistory(label);
      setGameState((prev) => {
        let s = ensureInningScore(prev);
        if (action === "homerun") {
          const on = (s.bases[0] ? 1 : 0) + (s.bases[1] ? 1 : 0) + (s.bases[2] ? 1 : 0);
          const scored = on + 1;
          showMessage(scored === 4 ? "満塁ホームラン!!" : scored >= 2 ? `${scored}ランHR!` : "ソロホームラン!");
          s = addRuns(s, scored);
          s = addHits(s, 1);
          return { ...resetCount(s), bases: [false, false, false], currentBatter: nextBatter() };
        }
        // triple
        let r = 0;
        if (s.bases[0]) r++; if (s.bases[1]) r++; if (s.bases[2]) r++;
        showMessage("三塁打!");
        s = addRuns(s, r);
        s = addHits(s, 1);
        return { ...resetCount(s), bases: [false, false, true], currentBatter: nextBatter() };
      });
      setPlaySeq((s) => s + 1);
      return;
    }

    // Single/double: proceed to runner resolution
    const play = buildPendingPlayCascaded(action as ComplexAction, gameState);
    if (!play) return;
    play.hitDirection = direction;

    const allSingle = play.slots.every((sl) => sl.options.length <= 1);
    if (allSingle) {
      pushHistory(label);
      resolvePlay(play);
    } else {
      setPendingPlay(play);
    }
  }, [pendingDirection, gameState, buildPendingPlayCascaded, resolvePlay, pushHistory, nextBatter, showMessage]);

  const cancelDirection = useCallback(() => setPendingDirection(null), []);

  // --- Fielding number selection (for outs) ---
  const updateFieldingNumbers = useCallback((numbers: number[]) => {
    setPendingFielding((prev) => prev ? { ...prev, numbers } : null);
  }, []);

  const confirmFielding = useCallback(() => {
    if (!pendingFielding) return;
    const { action, actionLabel, numbers } = pendingFielding;
    setPendingFielding(null);

    const play = buildPendingPlayCascaded(action, gameState);
    if (!play) return;
    play.fieldingNumbers = numbers;
    play.actionLabel = `${actionLabel} ${numbers.join("→")}`;

    const allSingle = play.slots.every((sl) => sl.options.length <= 1);
    if (allSingle) {
      pushHistory(play.actionLabel);
      resolvePlay(play);
    } else {
      setPendingPlay(play);
    }
  }, [pendingFielding, gameState, buildPendingPlayCascaded, resolvePlay, pushHistory]);

  const cancelFielding = useCallback(() => setPendingFielding(null), []);

  // --- Handle action from controls ---
  const handleAction = useCallback((action: GameAction) => {
    if (gameState.isGameOver && action !== "reset") return;

    // Check for strikeout
    if (action === "strike" && gameState.strikes >= 2) {
      setStrikeoutPending(true);
      return;
    }

    // Hit actions → direction selection first
    const hitActions: GameAction[] = ["single", "double", "homerun", "triple"];
    if (hitActions.includes(action)) {
      const label = ACTION_LABELS[action] ?? action;
      setPendingDirection({ action, label });
      return;
    }

    // Out actions → fielding number selection first
    const fieldingActions: ComplexAction[] = ["groundout", "flyout", "lineout", "sacrifice-fly", "sacrifice-bunt"];
    if (fieldingActions.includes(action as ComplexAction)) {
      const labelMap: Record<string, string> = {
        groundout: "ゴロ", flyout: "フライ", lineout: "ライナー",
        "sacrifice-fly": "犠飛", "sacrifice-bunt": "犠打",
      };
      // Check preconditions
      if (action === "sacrifice-fly" && !gameState.bases[2]) {
        showMessage("3塁走者がいません");
        return;
      }
      if (action === "sacrifice-bunt" && !gameState.bases[0] && !gameState.bases[1] && !gameState.bases[2]) {
        showMessage("走者がいません");
        return;
      }
      setPendingFielding({ action: action as ComplexAction, actionLabel: labelMap[action] ?? action, numbers: [] });
      return;
    }

    // Other complex actions → runner resolution directly
    const complexActions: ComplexAction[] = [
      "fielders-choice", "stolen-base", "caught-stealing",
      "wild-pitch", "passed-ball", "balk", "runner-out",
      "error", "dropped-third-strike", "catcher-interference",
      "obstruction", "offensive-interference",
    ];

    if (complexActions.includes(action as ComplexAction)) {
      const play = buildPendingPlayCascaded(action as ComplexAction, gameState);
      if (!play) {
        showMessage("走者がいません");
        return;
      }
      const allSingle = play.slots.every((sl) => sl.options.length <= 1);
      if (allSingle) {
        pushHistory(play.actionLabel);
        resolvePlay(play);
      } else {
        setPendingPlay(play);
      }
      return;
    }

    // Simple instant actions
    const label = ACTION_LABELS[action];
    if (label && action !== "reset") pushHistory(label);

    // Actions that complete a play (batter done)
    const completesPlay = action === "hit-by-pitch" || action === "walk" || action === "intentional-walk"
      || (action === "ball" && gameState.balls >= 3);

    setGameState((prev) => {
      let s = ensureInningScore(prev);
      switch (action) {
        case "ball": {
          const nb = s.balls + 1;
          if (nb >= 4) {
            showMessage("フォアボール!");
            const { newBases, runs } = forceAdvance(s.bases);
            s = addRuns(s, runs);
            return { ...resetCount(s), bases: newBases, currentBatter: nextBatter() };
          }
          return { ...s, balls: nb };
        }
        case "strike": {
          const ns = s.strikes + 1;
          return { ...s, strikes: ns };
        }
        case "foul": {
          if (s.strikes < 2) return { ...s, strikes: s.strikes + 1 };
          showMessage("ファウル!");
          return s;
        }
        case "hit-by-pitch": {
          showMessage("死球!");
          const { newBases, runs } = forceAdvance(s.bases);
          s = addRuns(s, runs);
          return { ...resetCount(s), bases: newBases, currentBatter: nextBatter() };
        }
        case "walk": {
          showMessage("フォアボール!");
          const { newBases, runs } = forceAdvance(s.bases);
          s = addRuns(s, runs);
          return { ...resetCount(s), bases: newBases, currentBatter: nextBatter() };
        }
        case "intentional-walk": {
          showMessage("敬遠!");
          const { newBases, runs } = forceAdvance(s.bases);
          s = addRuns(s, runs);
          return { ...resetCount(s), bases: newBases, currentBatter: nextBatter() };
        }
        case "reset": {
          showMessage("リセット!");
          setBatterIndex(0);
          setHistory([]);
          return initialGameState;
        }
        default:
          return s;
      }
    });

    if (completesPlay) setPlaySeq((s) => s + 1);
  }, [gameState, buildPendingPlayCascaded, resolvePlay, pushHistory, nextBatter, showMessage]);

  const updatePendingSlot = useCallback((slotIndex: number, dest: Destination) => {
    setPendingPlay((prev) => {
      if (!prev) return null;
      const newSlots = prev.slots.map((sl, i) =>
        i === slotIndex ? { ...sl, destination: dest } : sl,
      );
      cascadeSlots(newSlots, slotIndex);

      // Validate: no duplicate bases & all destinations must be in options
      const occupiedBases = newSlots
        .map((sl) => getSlotBase(sl))
        .filter((b): b is number => b !== null && b < 4);
      if (new Set(occupiedBases).size !== occupiedBases.length) return prev;
      if (!newSlots.every((sl) => sl.options.includes(sl.destination))) return prev;

      return { ...prev, slots: newSlots };
    });
  }, []);

  const resolveStrikeout = useCallback((type: StrikeoutType) => {
    const label = type === "swinging" ? "空振り三振" : "見逃し三振";
    pushHistory(label);
    showMessage(`${label}!`);
    setGameState((prev) => {
      let s = ensureInningScore(prev);
      const no = s.outs + 1;
      s = { ...resetCount(s), outs: no, currentBatter: nextBatter() };
      if (no >= 3) { showMessage("チェンジ!"); return checkThreeOuts(s); }
      return s;
    });
    setStrikeoutPending(false);
    setPlaySeq((s) => s + 1);
  }, [pushHistory, nextBatter, checkThreeOuts, showMessage]);

  const cancelPending = useCallback(() => setPendingPlay(null), []);

  const confirmPending = useCallback(() => {
    if (pendingPlay) {
      pushHistory(pendingPlay.actionLabel);
      resolvePlay(pendingPlay);
    }
  }, [pendingPlay, resolvePlay, pushHistory]);

  return {
    gameState,
    message,
    playSeq,
    pendingPlay,
    strikeoutPending,
    pendingDirection,
    pendingFielding,
    undoConfirmPending,
    lastHistoryLabel,
    handleAction,
    updatePendingSlot,
    cancelPending,
    confirmPending,
    resolveStrikeout,
    resolveDirection,
    cancelDirection,
    updateFieldingNumbers,
    confirmFielding,
    cancelFielding,
    requestUndo,
    confirmUndo,
    cancelUndo,
  };
}
