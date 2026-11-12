import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, Category } from "@prisma/client";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { CATEGORY_LABELS, CATEGORY_SLUGS, SLUG_TO_CATEGORY } from "@/lib/constants";

export const revalidate = 30;

/** Konkurranse og Kryssord vises som faner til hverandre, siden kryssord i praksis er en type konkurranse. */
const COMPETITION_TABS: Category[] = [Category.COMPETITION, Category.CROSSWORD];

export default async function KategoriPage({ params }: { params: { slug: string } }) {
  const category = SLUG_TO_CATEGORY[params.slug];
  if (!category) notFound();

  const articles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ category }, { additionalCategories: { has: category } }],
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="rule-thick border-ink pb-2 font-headline text-4xl font-bold text-ink">
        {CATEGORY_LABELS[category]}
      </h1>

      {COMPETITION_TABS.includes(category) && (
        <div className="mt-4 flex gap-2 font-sans text-sm uppercase tracking-wide">
          {COMPETITION_TABS.map((tab) => (
            <Link
              key={tab}
              href={`/kategori/${CATEGORY_SLUGS[tab]}`}
              className={`border px-3 py-1.5 ${
                tab === category
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/30 text-ink hover:border-ink"
              }`}
            >
              {CATEGORY_LABELS[tab]}
            </Link>
          ))}
        </div>
      )}

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
