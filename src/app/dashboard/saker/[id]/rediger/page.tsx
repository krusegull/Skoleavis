import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentRoster } from "@/lib/schoolYear";
import { canEditArticle } from "@/lib/permissions";
import { ArticleForm } from "@/components/dashboard/ArticleForm";

export default async function RedigerSakPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) return null;

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { contributors: true },
  });
  if (!article) notFound();

  if (!canEditArticle(session.user.role, article.authorId, session.user.id)) {
    redirect("/dashboard");
  }

  const roster = await getCurrentRoster();

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-ink">Rediger sak</h1>
      <div className="mt-6">
        <ArticleForm
          initialArticle={article}
          roster={roster}
          currentUser={{ id: session.user.id, name: session.user.name ?? "", role: session.user.role }}
        />
      </div>
    </div>
  );
}
