export type Workspace = "daytime" | "nighttime";

export type Session = "NYC" | "London" | "Asia";
export type Direction = "long" | "short";
export type ExecutionStatus =
  | "Fixed"
  | "Discretionary"
  | "Conservative"
  | "Aggressive";

export const CONFLUENCE_OPTIONS = [
  "OTE",
  "FVG",
  "IFVG",
  "Liquidity Grab",
  "Order Block",
  "Breaker",
] as const;

export const MISTAKE_OPTIONS = [
  "No Mistake",
  "FOMO",
  "Chased",
  "Early Exit",
  "Over-leveraged",
  "Revenge Trade",
] as const;

export interface Trade {
  id: string;
  workspace: Workspace;
  date: string; // yyyy-mm-dd
  accountBalance: number;
  usdRisk: number;
  entryPrice: number;
  stopLoss: number;
  exitPrice: number;
  direction: Direction;
  session: Session;
  asset: string;
  confluences: string[];
  mistakes: string[];
  executionStatus: ExecutionStatus;
  rulesFollowed: boolean;
  // computed
  positionSize: number;
  netPnl: number;
  rMultiple: number;
  // media (base64 data urls)
  htfImage?: string;
  ltfImage?: string;
  managementImage?: string;
  // journaling
  marketContext: string;
  lessonsLearned: string;
  priceAction: string;
  createdAt: string;
}

export interface WikiEntry {
  id: string;
  title: string;
  summary: string;
  body: string;
  image?: string;
  createdAt: string;
}

export interface PlaybookDoc {
  id: string;
  workspace: Workspace;
  title: string;
  body: string;
  updatedAt: string;
}

export interface DailyReview {
  id: string;
  workspace: Workspace;
  date: string;
  overtraded: boolean;
  followedDrawdownRule: boolean;
  followedMaxTrades: boolean;
  emotionalState: string;
  notes: string;
}

export type View =
  | "hub"
  | "dashboard"
  | "gallery"
  | "calendar"
  | "playbook"
  | "wiki"
  | "review";
