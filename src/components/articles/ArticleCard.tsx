import Link from "next/link";
import Image from "next/image";
import { Article, ArticleContributor } from "@prisma/client";
import { CategoryBadge } from "./CategoryBadge";
import { Byline } from "./Byline";
import { formatDate } from "@/lib/utils";

type ArticleWithContributors = Article & { contributors: ArticleContributor[] };

export function ArticleCard({
  article,
  size = "normal",
}: {
  article: ArticleWithContributors;
  size?: "normal" | "large";
}) {
  const isLarge = size === "large";

  return (
    <Link href={`/sak/${article.id}`} className="group block">
      {article.imageUrl && (
        <div className={`relative mb-3 w-full overflow-hidden bg-ink/10 ${isLarge ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <CategoryBadge category={article.category} />
      <h3
        className={`mt-2 font-headline font-bold text-ink group-hover:text-accent ${
          isLarge ? "text-3xl leading-tight sm:text-4xl" : "text-xl leading-snug"
        }`}
      >
        {article.title}
      </h3>
      <p className={`mt-2 font-serif text-ink/80 ${isLarge ? "text-lg" : "text-base"}`}>
        {article.teaser || article.ingress}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Byline contributors={article.contributors} />
        <span className="font-sans text-xs text-muted">· {formatDate(article.publishedAt)}</span>
      </div>
    </Link>
  );
}
