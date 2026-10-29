import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { CategoryBadge } from "@/components/articles/CategoryBadge";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { ensureRichTextHtml } from "@/lib/richTextCompat";
import { NewspaperVideo } from "@/components/media/NewspaperVideo";

export const revalidate = 30;

export default async function ArtikkelPage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
  });

  if (!article || article.status !== ArticleStatus.PUBLISHED) notFound();

  const bodyHtml = ensureRichTextHtml(article.body);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={article.category} />
        {article.additionalCategories.length > 0 && (
          <span className="font-sans text-xs text-muted">
            Også under: {article.additionalCategories.map((c) => CATEGORY_LABELS[c]).join(", ")}
          </span>
        )}
      </div>
      <h1 className="mt-3 font-headline text-4xl font-bold leading-tight text-ink sm:text-5xl">
        {article.title}
      </h1>
      {article.ingress && <p className="mt-4 font-serif text-xl italic text-ink/80">{article.ingress}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-y border-ink/20 py-3">
        <span className="font-sans text-xs text-muted">{formatDate(article.publishedAt)}</span>
      </div>

      {article.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.imageUrl}
          alt={article.title}
          className="mt-6 h-auto w-full bg-ink/10"
        />
      )}

      {article.videoUrl && (
        <NewspaperVideo src={article.videoUrl} muted={article.videoMuted} className="mt-6 h-auto w-full bg-ink" />
      )}

      <div className="prose-article mt-8" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </article>
  );
}
