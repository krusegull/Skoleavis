"use client";

import { useRef, useState } from "react";

/** Bilder smalere enn dette blir synlig uklare når de vises i full bredde i avisen. */
const MIN_SHARP_WIDTH = 1200;

/** Leser bredden på et bilde lokalt i nettleseren (ingen opplasting, ingen kostnad). */
function readImageWidth(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalWidth);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

export function ImageUploadField({
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
  const [warning, setWarning] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
    setWarning(null);

    const width = await readImageWidth(file);
    if (width !== null && width < MIN_SHARP_WIDTH) {
      setWarning(
        `Bildet er bare ${width} piksler bredt, så det vil se uklart ut i avisen. ` +
          `Bruk helst et bilde som er minst ${MIN_SHARP_WIDTH} piksler bredt: last opp originalfila ` +
          `fra mobil/kamera, eller åpne bildet i full størrelse før du kopierer det fra nettet ` +
          `(bilder kopiert rett fra et Google-søk er små miniatyrer).`
      );
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    setUploading(false);
    if (!res.ok) {
      setError(data.error || "Kunne ikke laste opp bildet.");
      return;
    }
    onChange(data.url);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (!item) return;
    const file = item.getAsFile();
    if (!file) return;
    e.preventDefault();
    await uploadFile(file);
  }

  return (
    <div>
      <label className="block font-sans text-xs uppercase tracking-wide text-muted">{label}</label>
      <div className="mt-1 flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          placeholder="https://… (eller lim inn et kopiert bilde her)"
          className="flex-1 border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 border border-ink px-3 py-2 font-sans text-xs uppercase tracking-wide hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {uploading ? "Laster opp…" : "Last opp bilde"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {error && <p className="mt-1 font-sans text-xs text-accent">{error}</p>}
      {warning && (
        <p className="mt-1 border-l-2 border-accent bg-accent/5 px-2 py-1 font-sans text-xs text-ink">⚠️ {warning}</p>
      )}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-2 max-h-40 border border-ink/20 object-cover" />
      )}
    </div>
  );
}
