import { useState } from "react";
import { Plus, Trash2, ImageOff, Upload, X } from "lucide-react";
import { WikiEntry } from "./types";
import { fileToCompressedDataUrl } from "./storage";
import Lightbox from "./Lightbox";

interface WikiProps {
  entries: WikiEntry[];
  onSave: (entry: WikiEntry) => void;
  onDelete: (id: string) => void;
}

function blank(): WikiEntry {
  return {
    id: crypto.randomUUID(),
    title: "",
    summary: "",
    body: "",
    createdAt: new Date().toISOString(),
  };
}

export default function Wiki({ entries, onSave, onDelete }: WikiProps) {
  const [editing, setEditing] = useState<WikiEntry | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-ink">PD Array Wiki</h1>
        <button
          onClick={() => setEditing(blank())}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-win text-black text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Entry
        </button>
      </div>
      <p className="text-sm text-muted mb-6">
        Your personal encyclopedia of PD Arrays and concepts — FVG, IFVG,
        Breaker Blocks, and anything else worth a quick reference.
      </p>

      {entries.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-16 text-center">
          <p className="text-sm text-muted">
            No reference entries yet. Add your first concept card.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setEditing(entry)}
              className="text-left bg-surface border border-border rounded-xl overflow-hidden hover:border-win/40 transition-colors"
            >
              <div className="aspect-video bg-panel flex items-center justify-center">
                {entry.image ? (
                  <img
                    src={entry.image}
                    alt={entry.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageOff size={20} className="text-muted" />
                )}
              </div>
              <div className="p-3.5">
                <p className="text-sm font-semibold text-ink mb-1">
                  {entry.title || "Untitled Concept"}
                </p>
                <p className="text-xs text-muted line-clamp-2">
                  {entry.summary || "No summary yet."}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {editing && (
        <WikiEditor
          entry={editing}
          onClose={() => setEditing(null)}
          onSave={(e) => {
            onSave(e);
            setEditing(null);
          }}
          onDelete={(id) => {
            onDelete(id);
            setEditing(null);
          }}
          onViewImage={(src) => setLightbox(src)}
        />
      )}

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

function WikiEditor({
  entry,
  onSave,
  onClose,
  onDelete,
  onViewImage,
}: {
  entry: WikiEntry;
  onSave: (e: WikiEntry) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  onViewImage: (src: string) => void;
}) {
  const [draft, setDraft] = useState<WikiEntry>(entry);
  const [busy, setBusy] = useState(false);

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setDraft((d) => ({ ...d, image: dataUrl }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-ink">Reference Card</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(draft.id)}
              className="p-2 rounded-lg text-muted hover:text-loss hover:bg-loss/10 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted hover:text-ink transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="border border-dashed border-border rounded-xl overflow-hidden bg-panel">
            {draft.image ? (
              <div className="relative aspect-video">
                <img
                  src={draft.image}
                  onClick={() => onViewImage(draft.image!)}
                  className="w-full h-full object-cover cursor-zoom-in"
                  alt="Reference diagram"
                />
                <button
                  onClick={() => setDraft((d) => ({ ...d, image: undefined }))}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-ink hover:text-loss transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <label className="aspect-video flex flex-col items-center justify-center gap-1.5 cursor-pointer text-muted hover:text-ink transition-colors">
                <Upload size={16} />
                <span className="text-xs font-medium">
                  {busy ? "Uploading..." : "Upload diagram"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
              </label>
            )}
          </div>

          <label className="block">
            <p className="label mb-1.5">Title</p>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Fair Value Gap (FVG)"
              className="input"
            />
          </label>

          <label className="block">
            <p className="label mb-1.5">Summary</p>
            <input
              value={draft.summary}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              placeholder="One-line definition"
              className="input"
            />
          </label>

          <label className="block">
            <p className="label mb-1.5">Details</p>
            <textarea
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              rows={8}
              placeholder="Full explanation, identification rules, examples..."
              className="input resize-none"
            />
          </label>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-win text-black hover:opacity-90 transition-opacity"
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}
