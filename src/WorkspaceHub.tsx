import type { ReactNode } from "react";
import { Sun, Moon as MoonIcon, ArrowRight } from "lucide-react";
import { Trade, Workspace } from "./types";
import { computeWorkspaceStats, formatUSD } from "./math";

interface WorkspaceHubProps {
  trades: Trade[];
  onSelect: (workspace: Workspace) => void;
}

export default function WorkspaceHub({ trades, onSelect }: WorkspaceHubProps) {
  const dayTrades = trades.filter((t) => t.workspace === "daytime");
  const nightTrades = trades.filter((t) => t.workspace === "nighttime");
  const dayStats = computeWorkspaceStats(dayTrades);
  const nightStats = computeWorkspaceStats(nightTrades);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-win uppercase mb-3">
            Workspace Hub
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight mb-3">
            Which session are you reviewing?
          </h1>
          <p className="text-muted text-sm max-w-md mx-auto">
            Each workspace keeps its own trades, stats, and calendar
            completely separate.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <WorkspaceCard
            icon={<Sun size={22} className="text-win" />}
            title="Daytime Session Trades"
            subtitle="London / NYC hours"
            stats={dayStats}
            onClick={() => onSelect("daytime")}
          />
          <WorkspaceCard
            icon={<MoonIcon size={22} className="text-win" />}
            title="Nighttime Session Trades"
            subtitle="Asia / after-hours"
            stats={nightStats}
            onClick={() => onSelect("nighttime")}
          />
        </div>
      </div>
    </div>
  );
}

function WorkspaceCard({
  icon,
  title,
  subtitle,
  stats,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  stats: ReturnType<typeof computeWorkspaceStats>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-surface border border-border rounded-2xl p-6 hover:border-win/50 transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-11 h-11 rounded-xl bg-win/10 flex items-center justify-center">
          {icon}
        </div>
        <ArrowRight
          size={18}
          className="text-muted group-hover:text-win group-hover:translate-x-0.5 transition-all"
        />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-0.5">{title}</h3>
      <p className="text-xs text-muted mb-5">{subtitle}</p>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
        <Stat label="Trades" value={String(stats.totalTrades)} />
        <Stat
          label="Win Rate"
          value={`${stats.winRate.toFixed(0)}%`}
        />
        <Stat
          label="Net PnL"
          value={formatUSD(stats.netPnl)}
          positive={stats.netPnl >= 0}
        />
      </div>
    </button>
  );
}

function Stat({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
        {label}
      </p>
      <p
        className={`text-sm font-semibold ${
          positive === undefined
            ? "text-ink"
            : positive
            ? "text-win"
            : "text-loss"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
