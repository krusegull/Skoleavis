import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";
import { ArticleStatus } from "@prisma/client";

/** Redaktør/admin godkjenner og publiserer en sak til godkjenning. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return NextResponse.json({ error: "Fant ikke saken" }, { status: 404 });
  if (article.status !== ArticleStatus.PENDING_REVIEW) {
    return NextResponse.json({ error: "Kun saker til godkjenning kan publiseres" }, { status: 400 });
  }

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      reviewedById: user.id,
    },
  });

  return NextResponse.json({ article: updated });
}
