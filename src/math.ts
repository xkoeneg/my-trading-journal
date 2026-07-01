import { Direction, Trade } from "./types";

export interface TradeMathInput {
  usdRisk: number;
  entryPrice: number;
  stopLoss: number;
  exitPrice: number;
  direction: Direction;
}

export interface TradeMathResult {
  positionSize: number;
  netPnl: number;
  rMultiple: number;
}

/**
 * Position sizing & PnL math:
 * riskPerUnit = |entry - stop|
 * positionSize = usdRisk / riskPerUnit   (1R of size)
 * rewardPerUnit = direction-adjusted (exit - entry)
 * netPnl = positionSize * rewardPerUnit
 * rMultiple = netPnl / usdRisk
 */
export function computeTradeMath(input: TradeMathInput): TradeMathResult {
  const { usdRisk, entryPrice, stopLoss, exitPrice, direction } = input;
  const riskPerUnit = Math.abs(entryPrice - stopLoss);

  if (!riskPerUnit || !usdRisk) {
    return { positionSize: 0, netPnl: 0, rMultiple: 0 };
  }

  const positionSize = usdRisk / riskPerUnit;
  const rewardPerUnit =
    direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice;
  const netPnl = positionSize * rewardPerUnit;
  const rMultiple = netPnl / usdRisk;

  return { positionSize, netPnl, rMultiple };
}

export function formatUSD(value: number): string {
  const sign = value < 0 ? "-" : value > 0 ? "+" : "";
  return `${sign}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatR(value: number): string {
  const sign = value < 0 ? "-" : value > 0 ? "+" : "";
  return `${sign}${Math.abs(value).toFixed(2)}R`;
}

export interface WorkspaceStats {
  winRate: number;
  profitFactor: number;
  netPnl: number;
  totalR: number;
  disciplineScore: number;
  totalTrades: number;
}

export function computeWorkspaceStats(trades: Trade[]): WorkspaceStats {
  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return {
      winRate: 0,
      profitFactor: 0,
      netPnl: 0,
      totalR: 0,
      disciplineScore: 0,
      totalTrades: 0,
    };
  }

  const wins = trades.filter((t) => t.netPnl > 0);
  const losses = trades.filter((t) => t.netPnl < 0);
  const grossProfit = wins.reduce((sum, t) => sum + t.netPnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.netPnl, 0));
  const netPnl = trades.reduce((sum, t) => sum + t.netPnl, 0);
  const totalR = trades.reduce((sum, t) => sum + t.rMultiple, 0);
  const rulesFollowedCount = trades.filter((t) => t.rulesFollowed).length;

  return {
    winRate: (wins.length / totalTrades) * 100,
    profitFactor: grossLoss === 0 ? grossProfit : grossProfit / grossLoss,
    netPnl,
    totalR,
    disciplineScore: (rulesFollowedCount / totalTrades) * 100,
    totalTrades,
  };
}
