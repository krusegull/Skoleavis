import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { ArticleCard } from "@/components/articles/ArticleCard";

export const revalidate = 30;

export default async function ForsidePage() {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    include: { contributors: true },
    orderBy: { publishedAt: "desc" },
    take: 13,
  });

  if (articles.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="font-serif text-xl text-muted">
          Ingen saker er publisert ennå. Følg med - redaksjonen jobber med neste utgave!
        </p>
      </div>
    );
  }

  const [hero, ...rest] = articles;
  const sideStories = rest.slice(0, 3);
  const gridStories = rest.slice(3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 border-b border-ink/30 pb-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ArticleCard article={hero} size="large" />
        </div>
        <div className="flex flex-col gap-6 divide-y divide-ink/20 lg:border-l lg:border-ink/20 lg:pl-6">
          {sideStories.map((article) => (
            <div key={article.id} className="pt-6 first:pt-0">
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>

      {gridStories.length > 0 && (
        <div className="mt-10">
          <h2 className="section-label mb-4">Flere saker</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {gridStories.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
