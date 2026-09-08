"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AboutPage } from "@prisma/client";

export function AboutPageForm({ initial }: { initial: AboutPage }) {
  const router = useRouter();

  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
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

      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">
          Bilde-URL (valgfritt, f.eks. et bilde av skolen)
        </label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
          className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">Tekst</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={14}
          className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
        />
        <p className="mt-1 font-sans text-xs text-muted">Tomme linjer skiller avsnitt.</p>
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
