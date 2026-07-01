import { PlaybookDoc, Workspace } from "./types";

interface PlaybookProps {
  workspace: Workspace;
  doc: PlaybookDoc;
  onChange: (doc: PlaybookDoc) => void;
}

export default function Playbook({ doc, onChange }: PlaybookProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <h1 className="text-xl font-semibold text-ink mb-1">Rules & Playbooks</h1>
      <p className="text-sm text-muted mb-5">
        Document your entry criteria, strategy models, and non-negotiable
        rules for this workspace.
      </p>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <input
          value={doc.title}
          onChange={(e) => onChange({ ...doc, title: e.target.value, updatedAt: new Date().toISOString() })}
          placeholder="Playbook title..."
          className="w-full bg-transparent px-5 py-4 text-lg font-semibold text-ink placeholder:text-muted focus:outline-none border-b border-border"
        />
        <textarea
          value={doc.body}
          onChange={(e) => onChange({ ...doc, body: e.target.value, updatedAt: new Date().toISOString() })}
          placeholder={`Write your strategy model here...\n\nExample structure:\n- Bias / HTF context requirements\n- Entry model (FVG, OTE, Order Block...)\n- Confirmation criteria\n- Stop loss & target rules\n- Maximum daily loss / trade count`}
          rows={22}
          className="w-full bg-transparent px-5 py-4 text-sm text-ink placeholder:text-muted focus:outline-none resize-none leading-relaxed"
        />
      </div>
      <p className="text-[11px] text-muted mt-2">
        Last updated{" "}
        {new Date(doc.updatedAt).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
