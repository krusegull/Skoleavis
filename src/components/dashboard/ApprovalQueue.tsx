"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Article, ArticleContributor } from "@prisma/client";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Byline } from "@/components/articles/Byline";
import { formatDateTime } from "@/lib/utils";

type ArticleWithExtras = Article & {
  contributors: ArticleContributor[];
  author: { name: string };
};

export function ApprovalQueue({ articles }: { articles: ArticleWithExtras[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function publish(id: string) {
    setBusyId(id);
    await fetch(`/api/articles/${id}/publish`, { method: "POST" });
    setBusyId(null);
    router.refresh();
  }

  async function reject(id: string) {
    const reason = prompt("Begrunnelse for avvisning (valgfritt):") ?? "";
    setBusyId(id);
    await fetch(`/api/articles/${id}/reject`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setBusyId(null);
    router.refresh();
  }

  if (articles.length === 0) {
    return <p className="font-serif text-muted">Ingen saker venter på godkjenning akkurat nå.</p>;
  }

  return (
    <ul className="divide-y divide-ink/20">
      {articles.map((article) => (
        <li key={article.id} className="py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-sans text-xs uppercase tracking-wide text-muted">
                {CATEGORY_LABELS[article.category]} · innsendt av {article.author.name} ·{" "}
                {formatDateTime(article.updatedAt)}
              </p>
              <p className="mt-1 font-headline text-xl font-bold text-ink">{article.title}</p>
              <p className="mt-1 font-serif text-ink/80">{article.ingress}</p>
              <div className="mt-1">
                <Byline contributors={article.contributors} />
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 font-sans text-xs uppercase tracking-wide">
              <Link
                href={`/dashboard/saker/${article.id}/rediger`}
                className="border border-ink px-3 py-1 text-center hover:bg-ink hover:text-paper"
              >
                Se / rediger
              </Link>
              <button
                disabled={busyId === article.id}
                onClick={() => publish(article.id)}
                className="border border-ink bg-ink px-3 py-1 text-paper hover:bg-accent hover:border-accent disabled:opacity-50"
              >
                Godkjenn og publiser
              </button>
              <button
                disabled={busyId === article.id}
                onClick={() => reject(article.id)}
                className="border border-accent px-3 py-1 text-accent hover:bg-accent hover:text-paper disabled:opacity-50"
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
