"use client";

import { useAppContext } from "@/lib/store";

export function LoginScreen() {
  const { setLogin } = useAppContext();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F8F9FB]">
      {/* Logo area */}
      <div className="mb-12 flex flex-col items-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#2563EB] shadow-md">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 5.58 2 10c0 2.13 1.13 4.05 2.92 5.42L4 22l4.2-2.8c1.2.36 2.46.55 3.8.55 5.52 0 10-3.58 10-8S17.52 2 12 2Z"
              fill="white"
            />
            <circle cx="8.5" cy="10" r="1.2" fill="#2563EB" />
            <circle cx="12" cy="10" r="1.2" fill="#2563EB" />
            <circle cx="15.5" cy="10" r="1.2" fill="#2563EB" />
          </svg>
        </div>
        <div className="mb-1 text-[10px] font-bold tracking-[0.3em] text-[#2563EB]">
          KYONO GROUND
        </div>
        <h1 className="text-xl font-black text-[#1A1D23]">
          {"スコアブック"}
        </h1>
        <p className="mt-2 text-xs text-[#6B7280]">
          {"チームの試合をスコアブックで記録しよう"}
        </p>
      </div>

      {/* LINE Login Button */}
      <button
        onClick={() => setLogin("ゲスト")}
        className="flex w-64 items-center justify-center gap-3 rounded-xl bg-[#06C755] px-6 py-3.5 font-bold text-white shadow-md transition-all active:scale-95"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
        <span className="text-base">{"LINEでログイン"}</span>
      </button>

      {/* Footer */}
      <p className="mt-8 text-[10px] text-[#9CA3AF]">
        {"LINEアカウントでかんたんログイン"}
      </p>
    </div>
  );
}
