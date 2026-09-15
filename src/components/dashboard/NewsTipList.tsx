"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NewsTip } from "@prisma/client";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export function NewsTipList({ tips }: { tips: NewsTip[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function dismiss(id: string) {
    setBusyId(id);
    await fetch(`/api/news-tips/${id}/dismiss`, { method: "POST" });
    setBusyId(null);
    router.refresh();
  }

  async function createArticle(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/news-tips/${id}/create-article`, { method: "POST" });
    setBusyId(null);
    if (!res.ok) return;
    const { article } = await res.json();
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
                disabled={busyId === tip.id}
                onClick={() => createArticle(tip.id)}
                className="border border-ink bg-ink px-3 py-1 text-paper hover:bg-accent hover:border-accent disabled:opacity-50"
              >
                Lag sak
              </button>
              <button
                disabled={busyId === tip.id}
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
  );
}
