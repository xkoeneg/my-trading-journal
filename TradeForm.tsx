import { useMemo, useState, type ReactNode } from "react";
import {
  X,
  Trash2,
  Upload,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  CONFLUENCE_OPTIONS,
  Direction,
  ExecutionStatus,
  MISTAKE_OPTIONS,
  Session,
  Trade,
  Workspace,
} from "../types";
import { computeTradeMath, formatR, formatUSD } from "../lib/math";
import { fileToCompressedDataUrl } from "../lib/storage";
import Lightbox from "./Lightbox";

interface TradeFormProps {
  workspace: Workspace;
  existing?: Trade;
  onSave: (trade: Trade) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const EXECUTION_OPTIONS: ExecutionStatus[] = [
  "Fixed",
  "Discretionary",
  "Conservative",
  "Aggressive",
];
const SESSION_OPTIONS: Session[] = ["NYC", "London", "Asia"];

function blank(workspace: Workspace): Trade {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: crypto.randomUUID(),
    workspace,
    date: today,
    accountBalance: 10000,
    usdRisk: 100,
    entryPrice: 0,
    stopLoss: 0,
    exitPrice: 0,
    direction: "long",
    session: "NYC",
    asset: "",
    confluences: [],
    mistakes: [],
    executionStatus: "Discretionary",
    rulesFollowed: true,
    positionSize: 0,
    netPnl: 0,
    rMultiple: 0,
    marketContext: "",
    lessonsLearned: "",
    priceAction: "",
    createdAt: new Date().toISOString(),
  };
}

export default function TradeForm({
  workspace,
  existing,
  onSave,
  onDelete,
  onClose,
}: TradeFormProps) {
  const [draft, setDraft] = useState<Trade>(existing ?? blank(workspace));
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(
    null
  );
  const [uploading, setUploading] = useState<string | null>(null);

  const math = useMemo(
    () =>
      computeTradeMath({
        usdRisk: Number(draft.usdRisk) || 0,
        entryPrice: Number(draft.entryPrice) || 0,
        stopLoss: Number(draft.stopLoss) || 0,
        exitPrice: Number(draft.exitPrice) || 0,
        direction: draft.direction,
      }),
    [draft.usdRisk, draft.entryPrice, draft.stopLoss, draft.exitPrice, draft.direction]
  );

  function update<K extends keyof Trade>(key: K, value: Trade[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(key: "confluences" | "mistakes", tag: string) {
    setDraft((prev) => {
      const list = prev[key];
      const next = list.includes(tag)
        ? list.filter((t) => t !== tag)
        : [...list, tag];
      return { ...prev, [key]: next };
    });
  }

  async function handleUpload(
    field: "htfImage" | "ltfImage" | "managementImage",
    file: File | undefined
  ) {
    if (!file) return;
    setUploading(field);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      update(field, dataUrl as Trade[typeof field]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(null);
    }
  }

  function handleSubmit() {
    const final: Trade = {
      ...draft,
      accountBalance: Number(draft.accountBalance) || 0,
      usdRisk: Number(draft.usdRisk) || 0,
      entryPrice: Number(draft.entryPrice) || 0,
      stopLoss: Number(draft.stopLoss) || 0,
      exitPrice: Number(draft.exitPrice) || 0,
      positionSize: math.positionSize,
      netPnl: math.netPnl,
      rMultiple: math.rMultiple,
    };
    onSave(final);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-3xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface rounded-t-2xl">
          <h2 className="text-base font-semibold text-ink">
            {existing ? "Edit Trade" : "New Trade Entry"}
          </h2>
          <div className="flex items-center gap-2">
            {existing && onDelete && (
              <button
                onClick={() => onDelete(existing.id)}
                className="p-2 rounded-lg text-muted hover:text-loss hover:bg-loss/10 transition-colors"
                title="Delete trade"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted hover:text-ink transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Math engine live output */}
          <div className="grid grid-cols-3 gap-3">
            <MathTile label="Position Size" value={math.positionSize.toFixed(4)} />
            <MathTile
              label="Net PnL"
              value={formatUSD(math.netPnl)}
              tone={math.netPnl >= 0 ? "win" : "loss"}
            />
            <MathTile
              label="R-Multiple"
              value={formatR(math.rMultiple)}
              tone={math.rMultiple >= 0 ? "win" : "loss"}
            />
          </div>

          {/* Core inputs */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Date">
              <input
                type="date"
                value={draft.date}
                onChange={(e) => update("date", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Asset / Pair">
              <input
                type="text"
                placeholder="NASDAQ 100, BTC..."
                value={draft.asset}
                onChange={(e) => update("asset", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Account Balance ($)">
              <input
                type="number"
                value={draft.accountBalance}
                onChange={(e) => update("accountBalance", Number(e.target.value) as Trade["accountBalance"])}
                className="input"
              />
            </Field>
            <Field label="USD Risk per Trade ($)">
              <input
                type="number"
                value={draft.usdRisk}
                onChange={(e) => update("usdRisk", Number(e.target.value) as Trade["usdRisk"])}
                className="input"
              />
            </Field>
            <Field label="Entry Price">
              <input
                type="number"
                step="any"
                value={draft.entryPrice}
                onChange={(e) => update("entryPrice", Number(e.target.value) as Trade["entryPrice"])}
                className="input"
              />
            </Field>
            <Field label="Stop Loss">
              <input
                type="number"
                step="any"
                value={draft.stopLoss}
                onChange={(e) => update("stopLoss", Number(e.target.value) as Trade["stopLoss"])}
                className="input"
              />
            </Field>
            <Field label="Exit Price">
              <input
                type="number"
                step="any"
                value={draft.exitPrice}
                onChange={(e) => update("exitPrice", Number(e.target.value) as Trade["exitPrice"])}
                className="input"
              />
            </Field>
            <Field label="Session">
              <select
                value={draft.session}
                onChange={(e) => update("session", e.target.value as Session)}
                className="input"
              >
                {SESSION_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Direction + Execution + Rule compliance toggles */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Direction">
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => update("direction", "long" as Direction)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium transition-colors ${
                    draft.direction === "long"
                      ? "bg-win/15 text-win"
                      : "text-muted"
                  }`}
                >
                  <ArrowUpRight size={14} /> Long
                </button>
                <button
                  type="button"
                  onClick={() => update("direction", "short" as Direction)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium transition-colors border-l border-border ${
                    draft.direction === "short"
                      ? "bg-loss/15 text-loss"
                      : "text-muted"
                  }`}
                >
                  <ArrowDownRight size={14} /> Short
                </button>
              </div>
            </Field>

            <Field label="Execution Status">
              <select
                value={draft.executionStatus}
                onChange={(e) =>
                  update("executionStatus", e.target.value as ExecutionStatus)
                }
                className="input"
              >
                {EXECUTION_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Rule Compliance">
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => update("rulesFollowed", true as Trade["rulesFollowed"])}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium transition-colors ${
                    draft.rulesFollowed ? "bg-win/15 text-win" : "text-muted"
                  }`}
                >
                  <ShieldCheck size={14} /> Followed
                </button>
                <button
                  type="button"
                  onClick={() => update("rulesFollowed", false as Trade["rulesFollowed"])}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium transition-colors border-l border-border ${
                    !draft.rulesFollowed ? "bg-loss/15 text-loss" : "text-muted"
                  }`}
                >
                  <ShieldAlert size={14} /> Broken
                </button>
              </div>
            </Field>
          </div>

          {/* Tags */}
          <Field label="Confluences / PD Arrays">
            <div className="flex flex-wrap gap-2">
              {CONFLUENCE_OPTIONS.map((tag) => (
                <TagPill
                  key={tag}
                  label={tag}
                  active={draft.confluences.includes(tag)}
                  onClick={() => toggleTag("confluences", tag)}
                />
              ))}
            </div>
          </Field>

          <Field label="Mistakes">
            <div className="flex flex-wrap gap-2">
              {MISTAKE_OPTIONS.map((tag) => (
                <TagPill
                  key={tag}
                  label={tag}
                  active={draft.mistakes.includes(tag)}
                  tone="loss"
                  onClick={() => toggleTag("mistakes", tag)}
                />
              ))}
            </div>
          </Field>

          {/* Media slots */}
          <div>
            <p className="label mb-2">Multi-Timeframe Evidence</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <MediaSlot
                label="HTF Context"
                image={draft.htfImage}
                busy={uploading === "htfImage"}
                onUpload={(f) => handleUpload("htfImage", f)}
                onView={() =>
                  draft.htfImage &&
                  setLightbox({ src: draft.htfImage, label: "HTF Context" })
                }
                onRemove={() => update("htfImage", undefined)}
              />
              <MediaSlot
                label="LTF Setup Entry"
                image={draft.ltfImage}
                busy={uploading === "ltfImage"}
                onUpload={(f) => handleUpload("ltfImage", f)}
                onView={() =>
                  draft.ltfImage &&
                  setLightbox({ src: draft.ltfImage, label: "LTF Setup Entry" })
                }
                onRemove={() => update("ltfImage", undefined)}
              />
              <MediaSlot
                label="Trade Mgmt / Exit"
                image={draft.managementImage}
                busy={uploading === "managementImage"}
                onUpload={(f) => handleUpload("managementImage", f)}
                onView={() =>
                  draft.managementImage &&
                  setLightbox({
                    src: draft.managementImage,
                    label: "Trade Management / Exit",
                  })
                }
                onRemove={() => update("managementImage", undefined)}
              />
            </div>
          </div>

          {/* Journaling */}
          <Field label="Market Context & Intuition">
            <textarea
              value={draft.marketContext}
              onChange={(e) => update("marketContext", e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="What was the higher-timeframe narrative going into this trade?"
            />
          </Field>
          <Field label="Price Action Observations">
            <textarea
              value={draft.priceAction}
              onChange={(e) => update("priceAction", e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="What did price actually do around entry and exit?"
            />
          </Field>
          <Field label="Lessons Learned & Mistakes Review">
            <textarea
              value={draft.lessonsLearned}
              onChange={(e) => update("lessonsLearned", e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="What would you repeat or change next time?"
            />
          </Field>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-surface rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-win text-black hover:opacity-90 transition-opacity"
          >
            {existing ? "Save Changes" : "Log Trade"}
          </button>
        </div>
      </div>

      {lightbox && (
        <Lightbox
          src={lightbox.src}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function MathTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "win" | "loss";
}) {
  return (
    <div className="bg-panel border border-border rounded-xl p-3.5 text-center">
      <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
        {label}
      </p>
      <p
        className={`text-base font-bold ${
          tone === "win" ? "text-win" : tone === "loss" ? "text-loss" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <p className="label mb-1.5">{label}</p>
      {children}
    </label>
  );
}

function TagPill({
  label,
  active,
  onClick,
  tone = "win",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: "win" | "loss";
}) {
  const activeClasses =
    tone === "win" ? "bg-win/15 border-win/50 text-win" : "bg-loss/15 border-loss/50 text-loss";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active ? activeClasses : "border-border text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function MediaSlot({
  label,
  image,
  busy,
  onUpload,
  onView,
  onRemove,
}: {
  label: string;
  image?: string;
  busy: boolean;
  onUpload: (file: File | undefined) => void;
  onView: () => void;
  onRemove: () => void;
}) {
  const inputId = `upload-${label.replace(/\s/g, "-")}`;
  return (
    <div className="border border-dashed border-border rounded-xl overflow-hidden bg-panel">
      {image ? (
        <div className="relative group aspect-video">
          <img
            src={image}
            onClick={onView}
            alt={label}
            className="w-full h-full object-cover cursor-zoom-in"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-ink hover:text-loss transition-colors"
          >
            <Trash2 size={12} />
          </button>
          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/70 text-ink">
            {label}
          </span>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="aspect-video flex flex-col items-center justify-center gap-1.5 cursor-pointer text-muted hover:text-ink transition-colors"
        >
          <Upload size={16} />
          <span className="text-[11px] font-medium px-2 text-center">
            {busy ? "Uploading..." : label}
          </span>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
        </label>
      )}
    </div>
  );
}
