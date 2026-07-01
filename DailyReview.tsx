import { useMemo, useState } from "react";
import { Plus, Check, X as XIcon } from "lucide-react";
import { DailyReview as DailyReviewType, Workspace } from "../types";

interface DailyReviewProps {
  workspace: Workspace;
  reviews: DailyReviewType[];
  onSave: (review: DailyReviewType) => void;
  onDelete: (id: string) => void;
}

function blank(workspace: Workspace): DailyReviewType {
  return {
    id: crypto.randomUUID(),
    workspace,
    date: new Date().toISOString().slice(0, 10),
    overtraded: false,
    followedDrawdownRule: true,
    followedMaxTrades: true,
    emotionalState: "",
    notes: "",
  };
}

export default function DailyReview({
  workspace,
  reviews,
  onSave,
  onDelete,
}: DailyReviewProps) {
  const [draft, setDraft] = useState<DailyReviewType>(() => blank(workspace));

  const sorted = useMemo(
    () => [...reviews].sort((a, b) => b.date.localeCompare(a.date)),
    [reviews]
  );

  function submit() {
    onSave(draft);
    setDraft(blank(workspace));
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <h1 className="text-xl font-semibold text-ink mb-1">Daily Performance Review</h1>
      <p className="text-sm text-muted mb-5">
        A quick discipline checklist to log at the end of every session.
      </p>

      <div className="bg-surface border border-border rounded-2xl p-5 mb-8">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <label className="block">
            <p className="label mb-1.5">Date</p>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="input"
            />
          </label>
          <label className="block">
            <p className="label mb-1.5">Emotional State</p>
            <input
              type="text"
              value={draft.emotionalState}
              onChange={(e) => setDraft({ ...draft, emotionalState: e.target.value })}
              placeholder="Calm, anxious, tilted..."
              className="input"
            />
          </label>
        </div>

        <div className="space-y-2 mb-4">
          <ChecklistRow
            question="Did I overtrade today?"
            value={draft.overtraded}
            invert
            onChange={(v) => setDraft({ ...draft, overtraded: v })}
          />
          <ChecklistRow
            question="Did I follow my maximum daily drawdown rule?"
            value={draft.followedDrawdownRule}
            onChange={(v) => setDraft({ ...draft, followedDrawdownRule: v })}
          />
          <ChecklistRow
            question="Did I stay within my maximum trade count?"
            value={draft.followedMaxTrades}
            onChange={(v) => setDraft({ ...draft, followedMaxTrades: v })}
          />
        </div>

        <label className="block mb-4">
          <p className="label mb-1.5">Notes</p>
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            rows={3}
            placeholder="Anything else worth remembering about today..."
            className="input resize-none"
          />
        </label>

        <button
          onClick={submit}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-win text-black text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Save Review
        </button>
      </div>

      <h2 className="text-sm font-semibold text-ink mb-3">Past Reviews</h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted">No reviews logged yet.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((r) => (
            <div
              key={r.id}
              className="bg-surface border border-border rounded-xl p-4 flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium text-ink mb-1">
                  {new Date(r.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {r.emotionalState && (
                    <span className="text-muted font-normal"> · {r.emotionalState}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  <Badge ok={!r.overtraded} label="Overtraded" invertLabel />
                  <Badge ok={r.followedDrawdownRule} label="Drawdown Rule" />
                  <Badge ok={r.followedMaxTrades} label="Max Trades" />
                </div>
                {r.notes && <p className="text-xs text-muted">{r.notes}</p>}
              </div>
              <button
                onClick={() => onDelete(r.id)}
                className="text-xs text-muted hover:text-loss transition-colors shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChecklistRow({
  question,
  value,
  onChange,
  invert,
}: {
  question: string;
  value: boolean;
  onChange: (v: boolean) => void;
  invert?: boolean;
}) {
  const positive = invert ? !value : value;
  return (
    <div className="flex items-center justify-between bg-panel border border-border rounded-lg px-3.5 py-2.5">
      <p className="text-sm text-ink">{question}</p>
      <div className="flex rounded-lg border border-border overflow-hidden text-xs">
        <button
          onClick={() => onChange(true)}
          className={`px-3 py-1.5 font-medium transition-colors ${
            value === true
              ? invert
                ? "bg-loss/15 text-loss"
                : "bg-win/15 text-win"
              : "text-muted"
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={`px-3 py-1.5 font-medium border-l border-border transition-colors ${
            value === false
              ? invert
                ? "bg-win/15 text-win"
                : "bg-loss/15 text-loss"
              : "text-muted"
          }`}
        >
          No
        </button>
      </div>
      <span className="sr-only">{positive ? "good" : "needs attention"}</span>
    </div>
  );
}

function Badge({ ok, label, invertLabel }: { ok: boolean; label: string; invertLabel?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
        ok ? "bg-win/15 text-win" : "bg-loss/15 text-loss"
      }`}
    >
      {ok ? <Check size={11} /> : <XIcon size={11} />}
      {invertLabel ? label : label}
    </span>
  );
}
