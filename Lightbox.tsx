import { X } from "lucide-react";

interface LightboxProps {
  src: string;
  label?: string;
  onClose: () => void;
}

export default function Lightbox({ src, label, onClose }: LightboxProps) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 rounded-full bg-surface border border-border text-ink hover:text-loss transition-colors"
      >
        <X size={18} />
      </button>
      {label && (
        <span className="absolute top-6 left-6 text-xs font-medium px-2.5 py-1 rounded-full bg-surface border border-border text-ink">
          {label}
        </span>
      )}
      <img
        src={src}
        alt={label || "Trade evidence"}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] max-w-full rounded-lg object-contain shadow-2xl"
      />
    </div>
  );
}
