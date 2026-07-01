import type { ReactNode } from "react";
import { Percent, TrendingUp, DollarSign, Target, ShieldCheck } from "lucide-react";
import { Trade } from "../types";
import { computeWorkspaceStats, formatUSD, formatR } from "../lib/math";
import TradeCard from "./TradeCard";

interface DashboardProps {
  trades: Trade[];
  privacyMode: boolean;
  onOpenTrade: (trade: Trade) => void;
}

export default function Dashboard({ trades, privacyMode, onOpenTrade }: DashboardProps) {
  const stats = computeWorkspaceStats(trades);
  const recent = [...trades]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <h1 className="text-xl font-semibold text-ink mb-5">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          icon={<Percent size={16} />}
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
        />
        <MetricCard
          icon={<Target size={16} />}
          label="Profit Factor"
          value={stats.profitFactor.toFixed(2)}
        />
        <MetricCard
          icon={<DollarSign size={16} />}
          label="Net PnL"
          value={formatUSD(stats.netPnl)}
          tone={stats.netPnl >= 0 ? "win" : "loss"}
          blur={privacyMode}
        />
        <MetricCard
          icon={<TrendingUp size={16} />}
          label="Total R"
          value={formatR(stats.totalR)}
          tone={stats.totalR >= 0 ? "win" : "loss"}
        />
        <MetricCard
          icon={<ShieldCheck size={16} />}
          label="Discipline Score"
          value={`${stats.disciplineScore.toFixed(0)}%`}
          tone={stats.disciplineScore >= 70 ? "win" : undefined}
        />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-ink">Recent Trades</h2>
      </div>

      {recent.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recent.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              privacyMode={privacyMode}
              onClick={() => onOpenTrade(trade)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
  blur,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "win" | "loss";
  blur?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-muted mb-2">
        {icon}
        <p className="text-[11px] uppercase tracking-wide font-medium">
          {label}
        </p>
      </div>
      <p
        className={`text-xl font-bold tracking-tight ${
          tone === "win" ? "text-win" : tone === "loss" ? "text-loss" : "text-ink"
        } ${blur ? "blur-sensitive" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border rounded-xl py-14 text-center">
      <p className="text-sm text-muted">
        No trades logged in this workspace yet. Add your first trade from the
        Trade Gallery.
      </p>
    </div>
  );
}
