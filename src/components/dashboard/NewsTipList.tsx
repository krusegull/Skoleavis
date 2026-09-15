"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NewsTip } from "@prisma/client";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export function NewsTipList({ tips }: { tips: NewsTip[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<{ id: string; action: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function dismiss(id: string) {
    setBusy({ id, action: "dismiss" });
    await fetch(`/api/news-tips/${id}/dismiss`, { method: "POST" });
    setBusy(null);
    router.refresh();
  }

  async function createArticle(id: string, aiDraft: boolean) {
    setError(null);
    setBusy({ id, action: aiDraft ? "ai" : "manual" });
    const res = await fetch(`/api/news-tips/${id}/create-article`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ aiDraft }),
    });
    setBusy(null);
    if (!res.ok) {
      setError("Kunne ikke opprette sak fra tipset.");
      return;
    }
    const { article, aiDraftFailed } = await res.json();
    if (aiDraftFailed) {
      setError("Klarte ikke å generere AI-utkast - en tom kladd ble opprettet i stedet.");
    }
    router.push(`/dashboard/saker/${article.id}/rediger`);
  }

  if (tips.length === 0) {
    return (
      <p className="font-serif text-muted">
        Ingen nye tips akkurat nå. Agenten leverer en ny oversikt hver torsdag.
      </p>
    );
  }

  return (
    <div>
      {error && <p className="mb-4 font-sans text-sm text-accent">{error}</p>}
      <ul className="divide-y divide-ink/20">
        {tips.map((tip) => (
          <li key={tip.id} className="py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-sans text-xs uppercase tracking-wide text-muted">
                  {tip.category ? CATEGORY_LABELS[tip.category] : "Ukategorisert"} · {formatDate(tip.createdAt)}
                </p>
                <p className="mt-1 font-headline text-xl font-bold text-ink">{tip.title}</p>
                <p className="mt-1 font-serif text-ink/80">{tip.summary}</p>
                <a
                  href={tip.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block font-sans text-xs text-accent underline underline-offset-2"
                >
                  Kilde: {tip.sourceName || tip.sourceUrl}
                </a>
              </div>
              <div className="flex shrink-0 flex-col gap-2 font-sans text-xs uppercase tracking-wide">
                <button
                  disabled={busy?.id === tip.id}
                  onClick={() => createArticle(tip.id, true)}
                  className="border border-ink bg-ink px-3 py-1 text-paper hover:bg-accent hover:border-accent disabled:opacity-50"
                  title="Claude skriver et førsteutkast du må lese gjennom og faktasjekke"
                >
                  {busy?.id === tip.id && busy.action === "ai" ? "Skriver…" : "Skriv utkast for meg"}
                </button>
                <button
                  disabled={busy?.id === tip.id}
                  onClick={() => createArticle(tip.id, false)}
                  className="border border-ink px-3 py-1 text-ink hover:bg-ink hover:text-paper disabled:opacity-50"
                >
                  Jeg skriver selv
                </button>
                <button
                  disabled={busy?.id === tip.id}
                  onClick={() => dismiss(tip.id)}
                  className="border border-ink/30 px-3 py-1 text-muted hover:border-ink hover:text-ink disabled:opacity-50"
                >
                  Avvis
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
