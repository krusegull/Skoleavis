"use client";

import { useRef, useState } from "react";

/**
 * Hard grense for videostørrelse. Videoer lastes opp direkte fra nettleseren
 * til Cloudinary (Vercel tåler ikke så store forespørsler), og hver visning
 * trekker båndbredde fra Cloudinary-kvoten - 50 MB holder til et par
 * minutter med god mobilvideo, uten at noen få visninger spiser opp
 * gratiskvoten. Ikke øk denne uten å vurdere kostnaden (se CLAUDE.md).
 */
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

/**
 * Laster opp direkte til Cloudinary med en signatur fra vår egen,
 * innloggingsbeskyttede /api/upload/signature - i motsetning til en
 * "unsigned upload preset" krever dette ingen egen Cloudinary-/Vercel-
 * konfigurasjon utover de vanlige bildeopplastings-nøklene som allerede
 * er satt opp.
 */
async function uploadVideo(file: File): Promise<string> {
  const sigRes = await fetch("/api/upload/signature", { method: "POST" });
  const sigData = await sigRes.json();
  if (!sigRes.ok) {
    throw new Error(sigData.error || "Kunne ikke starte opplastingen.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sigData.apiKey);
  formData.append("timestamp", String(sigData.timestamp));
  formData.append("signature", sigData.signature);
  formData.append("folder", sigData.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error("Opplastingen feilet. Prøv igjen, eller bruk en mindre fil.");
  }
  const data = await res.json();
  return data.secure_url as string;
}

export function VideoUploadField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
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
      setError(
        `Videoen er ${mb} MB - maks er 50 MB. Klipp den kortere, eller del den i mindre deler.`
      );
      return;
    }

    setUploading(true);
    try {
      const url = await uploadVideo(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke laste opp videoen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block font-sans text-xs uppercase tracking-wide text-muted">{label}</label>
      <div className="mt-1 flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Last opp en video (maks 50 MB)"
          className="flex-1 border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 border border-ink px-3 py-2 font-sans text-xs uppercase tracking-wide hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {uploading ? "Laster opp… (kan ta litt tid)" : "Last opp video"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 border border-ink/30 px-3 py-2 font-sans text-xs uppercase tracking-wide text-muted hover:border-accent hover:text-accent"
          >
            Fjern
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
      </div>
      {error && <p className="mt-1 font-sans text-xs text-accent">{error}</p>}
      {value && (
        <video src={value} controls playsInline preload="metadata" className="mt-2 max-h-60 border border-ink/20 bg-ink" />
      )}
    </div>
  );
}
