"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AboutPage } from "@prisma/client";
import { ImageUploadField } from "./ImageUploadField";
import { RichTextEditor } from "./RichTextEditor";
import { ensureRichTextHtml } from "@/lib/richTextCompat";

export function AboutPageForm({ initial }: { initial: AboutPage }) {
  const router = useRouter();

  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(ensureRichTextHtml(initial.body));
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    const res = await fetch("/api/about", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, body, imageUrl: imageUrl || null }),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Kunne ikke lagre. Sjekk at tittel er fylt ut.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">Tittel</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-headline text-2xl text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <ImageUploadField
        value={imageUrl}
        onChange={setImageUrl}
        label="Bilde (valgfritt, f.eks. et bilde av skolen)"
      />

      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">Tekst</label>
        <div className="mt-1">
          <RichTextEditor value={body} onChange={setBody} />
        </div>
      </div>

      {error && <p className="font-sans text-sm text-accent">{error}</p>}
      {saved && !error && <p className="font-sans text-sm text-ink">Lagret.</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="border border-ink bg-ink px-4 py-2 font-sans text-sm uppercase tracking-wide text-paper hover:bg-accent hover:border-accent disabled:opacity-50"
      >
        {saving ? "Lagrer…" : "Lagre"}
      </button>
    </div>
  );
}
