import Link from "next/link";
import Image from "next/image";
import { Article } from "@prisma/client";
import { CategoryBadge } from "./CategoryBadge";
import { formatDate } from "@/lib/utils";

/** Tett, strek-delt sak-oppføring brukt i forsidens avis-aktige kolonner. */
export function DenseArticleEntry({ article }: { article: Article }) {
  return (
    <Link href={`/sak/${article.id}`} className="group flex gap-3 py-4 first:pt-0">
      {article.imageUrl && (
        <div className="relative h-16 w-20 shrink-0 overflow-hidden bg-ink/10 sm:h-20 sm:w-24">
          <Image quality={90} src={article.imageUrl} alt={article.title} fill sizes="96px" className="object-cover" />
        </div>
      )}
      <div className="min-w-0">
        <CategoryBadge category={article.category} />
        <h3 className="mt-1 font-headline text-base font-bold leading-snug text-ink group-hover:text-accent sm:text-lg">
          {article.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="font-sans text-xs text-muted">{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
