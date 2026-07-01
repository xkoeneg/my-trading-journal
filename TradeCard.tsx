import { ImageOff, ShieldCheck, ShieldAlert } from "lucide-react";
import { Trade } from "../types";
import { formatUSD, formatR } from "../lib/math";

interface TradeCardProps {
  trade: Trade;
  privacyMode: boolean;
  onClick: () => void;
}

export default function TradeCard({ trade, privacyMode, onClick }: TradeCardProps) {
  const cover = trade.ltfImage || trade.htfImage || trade.managementImage;
  const isWin = trade.netPnl >= 0;

  return (
    <button
      onClick={onClick}
      className="group text-left bg-surface border border-border rounded-xl overflow-hidden hover:border-win/40 transition-colors flex flex-col"
    >
      <div className="relative aspect-video bg-panel flex items-center justify-center overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={`Trade ${trade.asset}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageOff size={22} className="text-muted" />
        )}
        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${
            trade.rulesFollowed
              ? "bg-win/20 text-win"
              : "bg-loss/20 text-loss"
          } flex items-center gap-1`}
        >
          {trade.rulesFollowed ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
          {trade.rulesFollowed ? "Rules Followed" : "Rules Broken"}
        </span>
        <span className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-bg/70 text-ink backdrop-blur-sm">
          {trade.session}
        </span>
      </div>

      <div className="p-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-semibold text-ink truncate">
            {trade.asset || "Untitled Asset"}
          </p>
          <span
            className={`text-xs font-bold ${isWin ? "text-win" : "text-loss"}`}
          >
            {formatR(trade.rMultiple)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted">
            {new Date(trade.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p
            className={`text-xs font-semibold ${
              isWin ? "text-win" : "text-loss"
            } ${privacyMode ? "blur-sensitive" : ""}`}
          >
            {formatUSD(trade.netPnl)}
          </p>
        </div>
      </div>
    </button>
  );
}
