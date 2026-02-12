"use client";

import { useAppContext, type Screen } from "@/lib/store";
import { Home, Trophy, User } from "lucide-react";

const tabs = [
  { id: "home", label: "ホーム", icon: Home, screen: "home" as Screen },
  { id: "scores", label: "試合", icon: Trophy, screen: "score-history" as Screen },
  { id: "mypage", label: "マイページ", icon: User, screen: "mypage" as Screen },
];

export function BottomTabs() {
  const { state, navigate } = useAppContext();
  const currentScreen = state.currentScreen;

  const hideTabsScreens: Screen[] = [
    "login",
    "team-select",
    "team-create",
    "game",
    "game-setup",
    "team-edit",
    "game-detail",
    "lineup",
    "defense",
  ];
  if (hideTabsScreens.includes(currentScreen)) {
    return null;
  }

  const getActiveTab = () => {
    if (currentScreen === "home") return "home";
    if (currentScreen === "score-history") return "scores";
    if (currentScreen === "mypage" || currentScreen === "roster") return "mypage";
    return null;
  };

  const activeTab = getActiveTab();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E5E7EB] bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.screen)}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 active:scale-95"
            >
              <Icon
                size={20}
                className={`transition-colors ${
                  isActive ? "text-[#2563EB]" : "text-[#9CA3AF]"
                }`}
              />
              <span
                className={`text-[9px] font-bold transition-colors ${
                  isActive ? "text-[#2563EB]" : "text-[#9CA3AF]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
