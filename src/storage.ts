import { useEffect, useState } from "react";

const PREFIX = "trade-journal:";

export function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveState<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error("Failed to persist state for", key, err);
  }
}

/** React hook that syncs a piece of state with localStorage. */
export function usePersistentState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(() => loadState<T>(key, fallback));

  useEffect(() => {
    saveState(key, state);
  }, [key, state]);

  return [state, setState] as const;
}

/** Convert a File to a compressed base64 data URL (downscaled + jpeg re-encoded). */
export function fileToCompressedDataUrl(
  file: File,
  maxDimension = 1400,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
