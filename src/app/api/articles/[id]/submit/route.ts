import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { ArticleStatus } from "@prisma/client";

/** Forfatteren sender en kladd til godkjenning. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return NextResponse.json({ error: "Fant ikke saken" }, { status: 404 });

  if (article.authorId !== user.id) {
    return NextResponse.json({ error: "Kun forfatteren kan sende saken til godkjenning" }, { status: 403 });
  }
  if (article.status !== ArticleStatus.DRAFT) {
    return NextResponse.json({ error: "Kun kladder kan sendes til godkjenning" }, { status: 400 });
  }

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { status: ArticleStatus.PENDING_REVIEW },
  });

  return NextResponse.json({ article: updated });
}
