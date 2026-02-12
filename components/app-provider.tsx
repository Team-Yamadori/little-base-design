"use client";

import { useState, useCallback, type ReactNode } from "react";
import { AppContext, type AppState, type Screen, type GameConfig } from "@/lib/store";
import {
  createDefaultMyTeam,
  createRandomOpponent,
  type Team,
  type GameRecord,
  type PlayerGameStats,
} from "@/lib/team-data";

// Screens
import { HomeMenu } from "@/components/screens/home-menu";
import { TeamEdit } from "@/components/screens/team-edit";
import { RosterScreen } from "@/components/screens/roster-screen";
import { LineupScreen } from "@/components/screens/lineup-screen";
import { GameSetupScreen } from "@/components/screens/game-setup-screen";
import { GameScreen } from "@/components/screens/game-screen";
import { ScoreHistoryScreen } from "@/components/screens/score-history-screen";
import { GameDetailScreen } from "@/components/screens/game-detail-screen";
import { LoginScreen } from "@/components/screens/login-screen";
import { TeamSelectScreen } from "@/components/screens/team-select-screen";
import { TeamCreateScreen } from "@/components/screens/team-create-screen";
import { MypageScreen } from "@/components/screens/mypage-screen";
import { BottomTabs } from "@/components/bottom-tabs";

function ScreenRouter({ screen }: { screen: Screen }) {
  switch (screen) {
    case "login":
      return <LoginScreen />;
    case "team-select":
      return <TeamSelectScreen />;
    case "team-create":
      return <TeamCreateScreen />;
    case "home":
      return <HomeMenu />;
    case "team-edit":
      return <TeamEdit />;
    case "roster":
      return <RosterScreen />;
    case "lineup":
      return <LineupScreen />;
    case "defense":
      return <LineupScreen />;
    case "game-setup":
      return <GameSetupScreen />;
    case "game":
      return <GameScreen />;
    case "player-stats":
      return <HomeMenu />;
    case "score-history":
      return <ScoreHistoryScreen />;
    case "game-detail":
      return <GameDetailScreen />;
    case "mypage":
      return <MypageScreen />;
    default:
      return <HomeMenu />;
  }
}

export function AppProvider({ children }: { children?: ReactNode }) {
  const [state, setState] = useState<AppState>({
    myTeam: createDefaultMyTeam(),
    opponent: createRandomOpponent(),
    gameRecords: [],
    playerGameStats: [],
    currentScreen: "login",
    gameConfig: { isTopOfInning: true, totalInnings: 9 },
    activeGameState: null,
    isLoggedIn: false,
    userName: "",
    teamCreated: false,
  });

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);

  const navigate = useCallback((screen: Screen) => {
    setState((s) => {
      setScreenHistory((h) => [...h, s.currentScreen]);
      return { ...s, currentScreen: screen };
    });
  }, []);

  const goBack = useCallback(() => {
    setScreenHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setState((s) => ({ ...s, currentScreen: prev }));
      return h.slice(0, -1);
    });
  }, []);

  const setMyTeam = useCallback((team: Team) => {
    setState((s) => ({ ...s, myTeam: team }));
  }, []);

  const setOpponent = useCallback((team: Team) => {
    setState((s) => ({ ...s, opponent: team }));
  }, []);

  const updateMyTeam = useCallback((updater: (team: Team) => Team) => {
    setState((s) => ({ ...s, myTeam: updater(s.myTeam) }));
  }, []);

  const addGameRecord = useCallback((record: GameRecord) => {
    setState((s) => ({ ...s, gameRecords: [...s.gameRecords, record] }));
  }, []);

  const addPlayerGameStats = useCallback((stats: PlayerGameStats[]) => {
    setState((s) => ({
      ...s,
      playerGameStats: [...s.playerGameStats, ...stats],
    }));
  }, []);

  const setGameConfig = useCallback((config: GameConfig) => {
    setState((s) => ({ ...s, gameConfig: config }));
  }, []);

  const setActiveGameState = useCallback(
    (gs: import("@/lib/game-state").GameState | null) => {
      setState((s) => ({ ...s, activeGameState: gs }));
    },
    []
  );

  const setLogin = useCallback((name: string) => {
    setState((s) => ({
      ...s,
      isLoggedIn: true,
      userName: name,
      currentScreen: s.teamCreated ? "home" : "team-select",
    }));
  }, []);

  const setTeamCreated = useCallback(() => {
    setState((s) => ({
      ...s,
      teamCreated: true,
      currentScreen: "home",
    }));
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({
      ...s,
      isLoggedIn: false,
      userName: "",
      currentScreen: "login",
    }));
  }, []);

  const showTabs = state.isLoggedIn && state.teamCreated;

  return (
    <AppContext.Provider
      value={{
        state,
        setMyTeam,
        setOpponent,
        updateMyTeam,
        addGameRecord,
        addPlayerGameStats,
        navigate,
        goBack,
        selectedGameId,
        setSelectedGameId,
        setGameConfig,
        setActiveGameState,
        setLogin,
        setTeamCreated,
        logout,
      }}
    >
      <>
        <ScreenRouter screen={state.currentScreen} />
        {showTabs && <BottomTabs />}
      </>
    </AppContext.Provider>
  );
}
