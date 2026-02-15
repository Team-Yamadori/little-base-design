export interface TeamData {
  name: string;
  shortName: string;
  scores: (number | null)[];
  runs: number;
  hits: number;
  errors: number;
  color: string;
}

export interface PlayerData {
  name: string;
  number: number;
  position: string;
  avg?: string;
  era?: string;
}

// Destinations for runners
export type Destination = "out" | "1B" | "2B" | "3B" | "home" | "stay";

export interface RunnerSlot {
  from: "batter" | "1B" | "2B" | "3B";
  label: string;
  destination: Destination;
  options: Destination[];
}

export interface PendingPlay {
  actionLabel: string;
  slots: RunnerSlot[];
  isHit: boolean;
  isError: boolean;
  preserveCount?: boolean;
  hitDirection?: HitDirection;
  fieldingNumbers?: number[];
}

// Simple instant actions
export type SimpleAction =
  | "ball"
  | "strike"
  | "foul"
  | "homerun"
  | "triple"
  | "hit-by-pitch"
  | "walk"
  | "intentional-walk"
  | "reset";

// Actions that open the runner resolution sheet
export type ComplexAction =
  | "single"
  | "double"
  | "groundout"
  | "flyout"
  | "lineout"
  | "sacrifice-fly"
  | "sacrifice-bunt"
  | "fielders-choice"
  | "stolen-base"
  | "caught-stealing"
  | "wild-pitch"
  | "passed-ball"
  | "balk"
  | "runner-out"
  | "error"
  | "dropped-third-strike"
  | "catcher-interference"
  | "obstruction"
  | "offensive-interference";

export type StrikeoutType = "swinging" | "looking";

export type HitDirection = "投" | "捕" | "一" | "二" | "三" | "遊" | "左" | "中" | "右";

export interface PendingFielding {
  action: ComplexAction;
  actionLabel: string;
  numbers: number[];
}

export interface HistoryEntry {
  state: GameState;
  batterIndex: number;
  label: string;
}

export type GameAction = SimpleAction | ComplexAction;

export const DEST_LABELS: Record<Destination, string> = {
  out: "OUT",
  "1B": "1塁",
  "2B": "2塁",
  "3B": "3塁",
  home: "得点",
  stay: "残留",
};

export const DEST_COLORS: Record<Destination, { bg: string; text: string; activeBg: string }> = {
  out: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", activeBg: "bg-[#FEE2E2]" },
  "1B": { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", activeBg: "bg-[#DBEAFE]" },
  "2B": { bg: "bg-[#ECFEFF]", text: "text-[#0891B2]", activeBg: "bg-[#CFFAFE]" },
  "3B": { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", activeBg: "bg-[#FEF3C7]" },
  home: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", activeBg: "bg-[#DCFCE7]" },
  stay: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", activeBg: "bg-[#E5E7EB]" },
};

export interface GameState {
  home: TeamData;
  away: TeamData;
  inning: number;
  isTop: boolean;
  balls: number;
  strikes: number;
  outs: number;
  bases: [boolean, boolean, boolean];
  currentBatter: PlayerData;
  currentPitcher: PlayerData;
  isPlaying: boolean;
  isGameOver: boolean;
}

export const initialGameState: GameState = {
  away: {
    name: "パワフルズ",
    shortName: "パワ",
    scores: [null, null, null, null, null, null, null, null, null],
    runs: 0,
    hits: 0,
    errors: 0,
    color: "hsl(0, 85%, 55%)",
  },
  home: {
    name: "あかつき大附",
    shortName: "あか",
    scores: [null, null, null, null, null, null, null, null, null],
    runs: 0,
    hits: 0,
    errors: 0,
    color: "hsl(210, 80%, 45%)",
  },
  inning: 1,
  isTop: true,
  balls: 0,
  strikes: 0,
  outs: 0,
  bases: [false, false, false],
  currentBatter: {
    name: "猪狩 守",
    number: 1,
    position: "投手",
    avg: ".321",
  },
  currentPitcher: {
    name: "早川 あおい",
    number: 18,
    position: "投手",
    era: "2.45",
  },
  isPlaying: true,
  isGameOver: false,
};
