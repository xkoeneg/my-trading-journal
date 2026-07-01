import { Eye, EyeOff, Moon, Sun, ArrowLeft } from "lucide-react";
import { Workspace } from "../types";

interface HeaderProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  activeWorkspace: Workspace | null;
  onBackToHub: () => void;
}

const workspaceLabel: Record<Workspace, string> = {
  daytime: "Daytime Session",
  nighttime: "Nighttime Session",
};

export default function Header({
  theme,
  onToggleTheme,
  privacyMode,
  onTogglePrivacy,
  activeWorkspace,
  onBackToHub,
}: HeaderProps) {
  return (
    <header className="h-16 shrink-0 border-b border-border flex items-center justify-between px-5 bg-surface">
      <div className="flex items-center gap-3">
        {activeWorkspace && (
          <button
            onClick={onBackToHub}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={16} />
            Hub
          </button>
        )}
        <div className="w-px h-5 bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-win/15 flex items-center justify-center">
            <span className="text-win font-bold text-sm">R</span>
          </div>
          <span className="font-semibold text-ink text-sm tracking-tight">
            Trade Journal
          </span>
          {activeWorkspace && (
            <span className="text-xs text-muted px-2 py-0.5 rounded-full bg-panel border border-border ml-1">
              {workspaceLabel[activeWorkspace]}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePrivacy}
          title="Privacy / LARP mode"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            privacyMode
              ? "bg-win/10 border-win/40 text-win"
              : "border-border text-muted hover:text-ink"
          }`}
        >
          {privacyMode ? <EyeOff size={14} /> : <Eye size={14} />}
          {privacyMode ? "Privacy On" : "Privacy Off"}
        </button>

        <button
          onClick={onToggleTheme}
          title="Toggle theme"
          className="p-2 rounded-lg border border-border text-muted hover:text-ink transition-colors"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
