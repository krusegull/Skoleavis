"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Article } from "@prisma/client";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export function MyArticlesList({ articles }: { articles: Article[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function submitForReview(id: string) {
    setBusyId(id);
    await fetch(`/api/articles/${id}/submit`, { method: "POST" });
    setBusyId(null);
    router.refresh();
  }

  async function deleteDraft(id: string) {
    if (!confirm("Slette denne kladden? Dette kan ikke angres.")) return;
    setBusyId(id);
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  if (articles.length === 0) {
    return <p className="font-serif text-muted">Du har ingen saker ennå.</p>;
  }

  return (
    <ul className="divide-y divide-ink/20">
      {articles.map((article) => (
        <li key={article.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="font-headline text-lg font-bold text-ink">{article.title || "(uten tittel)"}</p>
            <p className="font-sans text-xs uppercase tracking-wide text-muted">
              {CATEGORY_LABELS[article.category]} · {STATUS_LABELS[article.status]} ·{" "}
              {formatDateTime(article.updatedAt)}
            </p>
            {article.status === "REJECTED" && article.rejectionReason && (
              <p className="mt-1 font-serif text-sm text-accent">Avvist: {article.rejectionReason}</p>
            )}
          </div>
          <div className="flex gap-2 font-sans text-xs uppercase tracking-wide">
            {(article.status === "DRAFT" || article.status === "REJECTED") && (
              <>
                <Link
                  href={`/dashboard/saker/${article.id}/rediger`}
                  className="border border-ink px-3 py-1 hover:bg-ink hover:text-paper"
                >
                  Rediger
                </Link>
                {article.status === "DRAFT" && (
                  <button
                    disabled={busyId === article.id}
                    onClick={() => submitForReview(article.id)}
                    className="border border-accent px-3 py-1 text-accent hover:bg-accent hover:text-paper disabled:opacity-50"
                  >
                    Send til godkjenning
                  </button>
                )}
                <button
                  disabled={busyId === article.id}
                  onClick={() => deleteDraft(article.id)}
                  className="px-3 py-1 text-muted hover:text-accent disabled:opacity-50"
                >
                  Slett
                </button>
              </>
            )}
            {article.status === "PENDING_REVIEW" && (
              <span className="px-3 py-1 text-muted">Venter på godkjenning</span>
            )}
            {article.status === "PUBLISHED" && (
              <Link href={`/sak/${article.id}`} className="border border-ink px-3 py-1 hover:bg-ink hover:text-paper">
                Se saken
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
