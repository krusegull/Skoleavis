"use client";

import { useRef, useState } from "react";
import { MAX_VIDEO_BYTES, uploadVideo } from "./VideoUploadField";

export type ArticleVideoDraft = { url: string; muted: boolean };

export function ArticleVideoListField({
  videos,
  onChange,
  label,
}: {
  videos: ArticleVideoDraft[];
  onChange: (videos: ArticleVideoDraft[]) => void;
  label: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    setError(null);
    if (!file.type.startsWith("video/")) {
      setError("Filen må være en video.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      const mb = Math.round(file.size / (1024 * 1024));
      setError(`Videoen er ${mb} MB - maks er 50 MB. Klipp den kortere, eller del den i mindre deler.`);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadVideo(file);
      onChange([...videos, { url, muted: false }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke laste opp videoen.");
    } finally {
      setUploading(false);
    }
  }

  function removeVideo(index: number) {
    onChange(videos.filter((_, i) => i !== index));
  }

  function toggleMuted(index: number, muted: boolean) {
    onChange(videos.map((v, i) => (i === index ? { ...v, muted } : v)));
  }

  return (
    <div>
      <label className="block font-sans text-xs uppercase tracking-wide text-muted">{label}</label>

      {videos.length > 0 && (
        <ul className="mt-2 space-y-3">
          {videos.map((v, i) => (
            <li key={v.url} className="border border-ink/20 bg-white p-3">
              <video src={v.url} controls playsInline preload="metadata" muted={v.muted} className="max-h-48 bg-ink" />
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 font-sans text-sm text-ink">
                  <input type="checkbox" checked={v.muted} onChange={(e) => toggleMuted(i, e.target.checked)} />
                  Uten lyd - leserne kan ikke skru på lyden
                </label>
                <button
                  type="button"
                  onClick={() => removeVideo(i)}
                  className="shrink-0 font-sans text-xs uppercase tracking-wide text-muted hover:text-accent"
                >
                  Fjern
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border border-ink px-3 py-2 font-sans text-xs uppercase tracking-wide hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {uploading ? "Laster opp… (kan ta litt tid)" : "Legg til video (maks 50 MB)"}
        </button>
        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
      </div>
      {error && <p className="mt-1 font-sans text-xs text-accent">{error}</p>}
    </div>
  );
}
