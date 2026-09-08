import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { canApproveArticles } from "@/lib/permissions";
import { ApprovalQueue } from "@/components/dashboard/ApprovalQueue";

export default async function GodkjenningPage() {
  const session = await getServerSession(authOptions);
  if (!canApproveArticles(session?.user?.role)) redirect("/dashboard");

  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PENDING_REVIEW },
    include: { contributors: true, author: { select: { name: true } } },
    orderBy: { updatedAt: "asc" },
  });

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-ink">Til godkjenning</h1>
      <p className="mt-2 font-serif text-muted">Saker sendt inn av redaksjonen, venter på publisering.</p>
      <div className="mt-6">
        <ApprovalQueue articles={articles} />
      </div>
    </div>
  );
}
