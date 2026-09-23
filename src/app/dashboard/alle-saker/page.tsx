import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canApproveArticles } from "@/lib/permissions";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Byline } from "@/components/articles/Byline";
import { formatDate } from "@/lib/utils";
import { ArticleStatus } from "@prisma/client";

export default async function AlleSakerPage() {
  const session = await getServerSession(authOptions);
  if (!canApproveArticles(session?.user?.role)) redirect("/dashboard");

  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    include: { contributors: { orderBy: { sortOrder: "asc" } }, author: { select: { name: true } } },
  });

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-ink">Alle publiserte saker</h1>
      <p className="mt-2 font-serif text-muted">
        Som Redaktør/Admin kan du redigere enhver publisert sak herfra, uansett hvem som skrev den
        - ikke bare dine egne (se "Mine saker" for det).
      </p>

      {articles.length === 0 && <p className="mt-8 font-serif text-muted">Ingen publiserte saker ennå.</p>}

      <ul className="mt-6 divide-y divide-ink/20">
        {articles.map((article) => (
          <li key={article.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
            <div>
              <p className="font-sans text-xs uppercase tracking-wide text-muted">
                {CATEGORY_LABELS[article.category]} · forfatter: {article.author.name} ·{" "}
                {formatDate(article.publishedAt)}
              </p>
              <p className="mt-1 font-headline text-lg font-bold text-ink">{article.title}</p>
              <div className="mt-1">
                <Byline contributors={article.contributors} />
              </div>
            </div>
            <div className="flex shrink-0 gap-2 font-sans text-xs uppercase tracking-wide">
              <Link
                href={`/dashboard/saker/${article.id}/rediger`}
                className="border border-ink px-3 py-1 hover:bg-ink hover:text-paper"
              >
                Rediger
              </Link>
              <Link href={`/sak/${article.id}`} className="border border-ink px-3 py-1 hover:bg-ink hover:text-paper">
                Se saken
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
