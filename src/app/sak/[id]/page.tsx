import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { CategoryBadge } from "@/components/articles/CategoryBadge";
import { Byline } from "@/components/articles/Byline";
import { formatDate } from "@/lib/utils";

export const revalidate = 30;

export default async function ArtikkelPage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { contributors: { orderBy: { sortOrder: "asc" } } },
  });

  if (!article || article.status !== ArticleStatus.PUBLISHED) notFound();

  const paragraphs = article.body.split(/\n{2,}/).filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <CategoryBadge category={article.category} />
      <h1 className="mt-3 font-headline text-4xl font-bold leading-tight text-ink sm:text-5xl">
        {article.title}
      </h1>
      <p className="mt-4 font-serif text-xl italic text-ink/80">{article.ingress}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-y border-ink/20 py-3">
        <Byline contributors={article.contributors} />
        <span className="font-sans text-xs text-muted">· {formatDate(article.publishedAt)}</span>
      </div>

      {article.imageUrl && (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden bg-ink/10">
          <Image src={article.imageUrl} alt={article.title} fill className="object-cover" />
        </div>
      )}

      <div className="prose-article mt-8">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  );
}
