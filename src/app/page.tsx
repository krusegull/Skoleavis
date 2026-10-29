import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { CategoryBadge } from "@/components/articles/CategoryBadge";
import { DenseArticleEntry } from "@/components/articles/DenseArticleEntry";
import { formatDate } from "@/lib/utils";

export const revalidate = 30;

const COLUMN_COUNT = 3;

export default async function ForsidePage() {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: 17,
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

  const [hero, ...secondary] = articles;

  // Forhåndsdeler i kolonner (kolonne-vis rekkefølge) slik at desktop-visningen
  // kan strekdele uten divide-x/divide-y-feilen man får med en wrappende grid.
  const columns: (typeof secondary)[] = Array.from({ length: COLUMN_COUNT }, () => []);
  secondary.forEach((article, index) => {
    columns[index % COLUMN_COUNT].push(article);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href={`/sak/${hero.id}`} className="group block border-b-4 border-ink pb-8">
        {hero.imageUrl && (
          <div className="relative mb-4 aspect-[21/9] w-full overflow-hidden bg-ink/10">
            <Image quality={90}
              src={hero.imageUrl}
              alt={hero.title}
              fill
              sizes="100vw"
              priority
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <CategoryBadge category={hero.category} />
        <h2 className="mt-2 font-headline text-4xl font-bold leading-tight text-ink group-hover:text-accent sm:text-5xl lg:text-6xl">
          {hero.title}
        </h2>
        {(hero.teaser || hero.ingress) && (
          <p className="mt-3 max-w-3xl font-serif text-lg text-ink/80 sm:text-xl">{hero.teaser || hero.ingress}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-sans text-xs text-muted">{formatDate(hero.publishedAt)}</span>
        </div>
      </Link>

      {secondary.length > 0 && (
        <div className="mt-8">
          <h2 className="section-label mb-2">Flere saker</h2>

          {/* Mobil: én flat, kronologisk liste. */}
          <div className="divide-y divide-ink/20 lg:hidden">
            {secondary.map((article) => (
              <DenseArticleEntry key={article.id} article={article} />
            ))}
          </div>

          {/* Desktop: strekdelte kolonner (forhåndsdelt server-side). */}
          <div className="hidden lg:flex lg:divide-x lg:divide-ink/20">
            {columns.map((column, index) => (
              <div key={index} className="flex-1 divide-y divide-ink/20 px-6 first:pl-0 last:pr-0">
                {column.map((article) => (
                  <DenseArticleEntry key={article.id} article={article} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
