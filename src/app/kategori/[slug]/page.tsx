import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { CATEGORY_LABELS, SLUG_TO_CATEGORY } from "@/lib/constants";

export const revalidate = 30;

export default async function KategoriPage({ params }: { params: { slug: string } }) {
  const category = SLUG_TO_CATEGORY[params.slug];
  if (!category) notFound();

  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED, category },
    include: { contributors: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="rule-thick border-ink pb-2 font-headline text-4xl font-bold text-ink">
        {CATEGORY_LABELS[category]}
      </h1>

      {articles.length === 0 ? (
        <p className="mt-8 font-serif text-muted">Ingen publiserte saker i denne kategorien ennå.</p>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
