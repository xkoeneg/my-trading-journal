import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Trade } from "../types";
import { formatUSD } from "../lib/math";

interface CalendarViewProps {
  trades: Trade[];
  privacyMode: boolean;
}

export default function CalendarView({ trades, privacyMode }: CalendarViewProps) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const dailyPnl = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of trades) {
      map.set(t.date, (map.get(t.date) ?? 0) + t.netPnl);
    }
    return map;
  }, [trades]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthPnl = useMemo(() => {
    let total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = new Date(year, month, d).toISOString().slice(0, 10);
      total += dailyPnl.get(key) ?? 0;
    }
    return total;
  }, [dailyPnl, year, month, daysInMonth]);

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-ink">Performance Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="p-2 rounded-lg border border-border text-muted hover:text-ink transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-ink w-36 text-center">
            {monthLabel}
          </span>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="p-2 rounded-lg border border-border text-muted hover:text-ink transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        className={`rounded-2xl border p-4 mb-4 ${
          monthPnl > 0
            ? "border-win/50 bg-win/5 shadow-glow"
            : monthPnl < 0
            ? "border-loss/40 bg-loss/5"
            : "border-border bg-surface"
        }`}
      >
        <p className="text-xs text-muted mb-1">Month Net PnL</p>
        <p
          className={`text-2xl font-bold ${
            monthPnl >= 0 ? "text-win" : "text-loss"
          } ${privacyMode ? "blur-sensitive" : ""}`}
        >
          {formatUSD(monthPnl)}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-muted">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const key = new Date(year, month, day).toISOString().slice(0, 10);
          const pnl = dailyPnl.get(key);
          const hasData = pnl !== undefined;
          const positive = hasData && pnl! > 0;
          const negative = hasData && pnl! < 0;

          return (
            <div
              key={key}
              className={`aspect-square rounded-lg border p-2 flex flex-col justify-between transition-colors ${
                positive
                  ? "border-win/50 bg-win/10 shadow-glow"
                  : negative
                  ? "border-loss/40 bg-loss/10"
                  : "border-border bg-panel"
              }`}
            >
              <span className="text-[11px] text-muted">{day}</span>
              {hasData && (
                <span
                  className={`text-[11px] font-semibold ${
                    positive ? "text-win" : "text-loss"
                  } ${privacyMode ? "blur-sensitive" : ""}`}
                >
                  {formatUSD(pnl!)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
