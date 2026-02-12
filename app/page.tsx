import { AppProvider } from "@/components/app-provider";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center bg-[#EBEDF2]">
      <div className="flex min-h-dvh w-full max-w-md flex-col bg-[#F8F9FB] shadow-lg">
        <AppProvider />
      </div>
    </main>
  );
}
