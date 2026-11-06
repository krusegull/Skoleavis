import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { DenseArticleEntry } from "@/components/articles/DenseArticleEntry";

export const revalidate = 30;

export default async function ArkivPage() {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="rule-thick border-ink pb-2 font-headline text-4xl font-bold text-ink">Arkiv</h1>
      <p className="mt-2 font-serif text-muted">Alle publiserte saker, nyeste først.</p>

      <div className="mt-8 divide-y divide-ink/20">
        {articles.map((article) => (
          <DenseArticleEntry key={article.id} article={article} />
        ))}
      </div>

      {articles.length === 0 && <p className="mt-8 font-serif text-muted">Arkivet er tomt så langt.</p>}
    </div>
  );
}
