import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { CategoryBadge } from "@/components/articles/CategoryBadge";
import { Byline } from "@/components/articles/Byline";
import { formatDate } from "@/lib/utils";

export const revalidate = 30;

export default async function ArkivPage() {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    include: { contributors: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="rule-thick border-ink pb-2 font-headline text-4xl font-bold text-ink">Arkiv</h1>
      <p className="mt-2 font-serif text-muted">Alle publiserte saker, nyeste først.</p>

      <ul className="mt-8 divide-y divide-ink/20">
        {articles.map((article) => (
          <li key={article.id} className="py-4">
            <Link href={`/sak/${article.id}`} className="group block">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-headline text-xl font-bold text-ink group-hover:text-accent">
                  {article.title}
                </h2>
                <span className="font-sans text-xs text-muted">{formatDate(article.publishedAt)}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <CategoryBadge category={article.category} />
                <Byline contributors={article.contributors} />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {articles.length === 0 && <p className="mt-8 font-serif text-muted">Arkivet er tomt så langt.</p>}
    </div>
  );
}
