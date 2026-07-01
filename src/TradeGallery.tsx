import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Trade, Workspace } from "./types";
import TradeCard from "./TradeCard";
import TradeForm from "./TradeForm";

interface TradeGalleryProps {
  workspace: Workspace;
  trades: Trade[];
  privacyMode: boolean;
  onSave: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

export default function TradeGallery({
  workspace,
  trades,
  privacyMode,
  onSave,
  onDelete,
}: TradeGalleryProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "followed" | "broken">("all");
  const [editing, setEditing] = useState<Trade | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    return [...trades]
      .filter((t) => {
        if (filter === "followed" && !t.rulesFollowed) return false;
        if (filter === "broken" && t.rulesFollowed) return false;
        if (query && !t.asset.toLowerCase().includes(query.toLowerCase()))
          return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [trades, filter, query]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-xl font-semibold text-ink">Trade Gallery</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-win text-black text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Trade
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by asset..."
            className="input pl-8"
          />
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden text-sm">
          {(["all", "followed", "broken"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 font-medium transition-colors ${
                filter === f ? "bg-win/15 text-win" : "text-muted hover:text-ink"
              }`}
            >
              {f === "all" ? "All" : f === "followed" ? "Rules Followed" : "Rules Broken"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-16 text-center">
          <p className="text-sm text-muted mb-3">No trades match your filters yet.</p>
          <button
            onClick={() => setCreating(true)}
            className="text-sm font-semibold text-win hover:underline"
          >
            Log your first trade
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              privacyMode={privacyMode}
              onClick={() => setEditing(trade)}
            />
          ))}
        </div>
      )}

      {creating && (
        <TradeForm
          workspace={workspace}
          onSave={(t) => {
            onSave(t);
            setCreating(false);
          }}
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <TradeForm
          workspace={workspace}
          existing={editing}
          onSave={(t) => {
            onSave(t);
            setEditing(null);
          }}
          onDelete={(id) => {
            onDelete(id);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
