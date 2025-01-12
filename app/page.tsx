import { UserInfo } from "@/components/user-info";
import { AuthSection, MainContent } from "@/components/client-page";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎨</span>
          <span className="font-medium">emojis</span>
        </div>
        <div className="flex items-center gap-4">
          <UserInfo />
          <div className="auth-section">
            <AuthSection />
          </div>
        </div>
      </header>
      <MainContent />
    </div>
  );
}
