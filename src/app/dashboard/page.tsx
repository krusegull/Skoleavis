import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MyArticlesList } from "@/components/dashboard/MyArticlesList";

export default async function MineKladderPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const articles = await prisma.article.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold text-ink">Mine saker</h1>
        <Link
          href="/dashboard/saker/ny"
          className="border border-ink bg-ink px-4 py-2 font-sans text-sm uppercase tracking-wide text-paper hover:bg-accent hover:border-accent"
        >
          Ny sak
        </Link>
      </div>
      <div className="mt-6">
        <MyArticlesList articles={articles} />
      </div>
    </div>
  );
}
