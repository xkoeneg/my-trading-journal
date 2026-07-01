import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import WorkspaceHub from "./WorkspaceHub";
import Dashboard from "./Dashboard";
import TradeGallery from "./TradeGallery";
import CalendarView from "./CalendarView";
import Playbook from "./Playbook";
import DailyReview from "./DailyReview";
import Wiki from "./Wiki";
import TradeForm from "./TradeForm";
import { usePersistentState } from "./storage";
import {
  DailyReview as DailyReviewType,
  PlaybookDoc,
  Trade,
  View,
  WikiEntry,
  Workspace,
} from "./types";

function defaultPlaybooks(): Record<Workspace, PlaybookDoc> {
  const make = (workspace: Workspace, title: string): PlaybookDoc => ({
    id: crypto.randomUUID(),
    workspace,
    title,
    body: "",
    updatedAt: new Date().toISOString(),
  });
  return {
    daytime: make("daytime", "Daytime Session Playbook"),
    nighttime: make("nighttime", "Nighttime Session Playbook"),
  };
}

export default function App() {
  const [theme, setTheme] = usePersistentState<"dark" | "light">("theme", "dark");
  const [privacyMode, setPrivacyMode] = usePersistentState<boolean>("privacy", false);
  const [activeWorkspace, setActiveWorkspace] = usePersistentState<Workspace | null>(
    "active-workspace",
    null
  );
  const [view, setView] = usePersistentState<View>("view", "dashboard");

  const [trades, setTrades] = usePersistentState<Trade[]>("trades", []);
  const [playbooks, setPlaybooks] = usePersistentState<Record<Workspace, PlaybookDoc>>(
    "playbooks",
    defaultPlaybooks()
  );
  const [dailyReviews, setDailyReviews] = usePersistentState<DailyReviewType[]>(
    "daily-reviews",
    []
  );
  const [wikiEntries, setWikiEntries] = usePersistentState<WikiEntry[]>("wiki", []);
  const [quickTrade, setQuickTrade] = useState<Trade | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const workspaceTrades = trades.filter((t) => t.workspace === activeWorkspace);
  const workspaceReviews = dailyReviews.filter((r) => r.workspace === activeWorkspace);

  function selectWorkspace(ws: Workspace) {
    setActiveWorkspace(ws);
    setView("dashboard");
  }

  function saveTrade(trade: Trade) {
    setTrades((prev) => {
      const exists = prev.some((t) => t.id === trade.id);
      return exists ? prev.map((t) => (t.id === trade.id ? trade : t)) : [...prev, trade];
    });
  }

  function deleteTrade(id: string) {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }

  function saveReview(review: DailyReviewType) {
    setDailyReviews((prev) => {
      const exists = prev.some((r) => r.id === review.id);
      return exists
        ? prev.map((r) => (r.id === review.id ? review : r))
        : [...prev, review];
    });
  }

  function deleteReview(id: string) {
    setDailyReviews((prev) => prev.filter((r) => r.id !== id));
  }

  function saveWikiEntry(entry: WikiEntry) {
    setWikiEntries((prev) => {
      const exists = prev.some((e) => e.id === entry.id);
      return exists ? prev.map((e) => (e.id === entry.id ? entry : e)) : [...prev, entry];
    });
  }

  function deleteWikiEntry(id: string) {
    setWikiEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="h-screen flex flex-col bg-bg">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        privacyMode={privacyMode}
        onTogglePrivacy={() => setPrivacyMode(!privacyMode)}
        activeWorkspace={activeWorkspace}
        onBackToHub={() => setActiveWorkspace(null)}
      />

      {!activeWorkspace ? (
        <WorkspaceHub trades={trades} onSelect={selectWorkspace} />
      ) : (
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <Sidebar view={view} onNavigate={setView} />

          {view === "dashboard" && (
            <Dashboard
              trades={workspaceTrades}
              privacyMode={privacyMode}
              onOpenTrade={(t) => setQuickTrade(t)}
            />
          )}
          {view === "gallery" && (
            <TradeGallery
              workspace={activeWorkspace}
              trades={workspaceTrades}
              privacyMode={privacyMode}
              onSave={saveTrade}
              onDelete={deleteTrade}
            />
          )}
          {view === "calendar" && (
            <CalendarView trades={workspaceTrades} privacyMode={privacyMode} />
          )}
          {view === "review" && (
            <DailyReview
              workspace={activeWorkspace}
              reviews={workspaceReviews}
              onSave={saveReview}
              onDelete={deleteReview}
            />
          )}
          {view === "playbook" && (
            <Playbook
              workspace={activeWorkspace}
              doc={playbooks[activeWorkspace]}
              onChange={(doc) =>
                setPlaybooks((prev) => ({ ...prev, [activeWorkspace]: doc }))
              }
            />
          )}
          {view === "wiki" && (
            <Wiki
              entries={wikiEntries}
              onSave={saveWikiEntry}
              onDelete={deleteWikiEntry}
            />
          )}
        </div>
      )}

      {quickTrade && (
        <TradeForm
          workspace={quickTrade.workspace}
          existing={quickTrade}
          onSave={(t) => {
            saveTrade(t);
            setQuickTrade(null);
          }}
          onDelete={(id) => {
            deleteTrade(id);
            setQuickTrade(null);
          }}
          onClose={() => setQuickTrade(null)}
        />
      )}
    </div>
  );
}
