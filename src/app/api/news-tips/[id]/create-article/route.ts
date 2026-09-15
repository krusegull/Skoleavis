import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";
import { Category, ArticleStatus } from "@prisma/client";

/**
 * Redaktør/admin: oppretter en ny, tom kladd basert på et nyhetstips.
 * Ingressen viser kun forslaget til vinkling + kilde - selve brødteksten
 * må skrives originalt av redaksjonen, aldri kopiert fra kilden.
 */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const tip = await prisma.newsTip.findUnique({ where: { id: params.id } });
  if (!tip) return NextResponse.json({ error: "Fant ikke tipset" }, { status: 404 });
  if (tip.articleId) return NextResponse.json({ error: "Det er allerede laget en sak fra dette tipset" }, { status: 400 });

  const author = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { name: true } });

  const article = await prisma.$transaction(async (tx) => {
    const created = await tx.article.create({
      data: {
        title: tip.title,
        ingress: `Forslag til vinkling: ${tip.summary}`,
        body: "",
        category: tip.category ?? Category.NEWS,
        status: ArticleStatus.DRAFT,
        authorId: user.id,
        contributors: {
          create: { userId: user.id, nameSnapshot: author.name, roleSnapshot: user.role! },
        },
      },
    });
    await tx.newsTip.update({ where: { id: tip.id }, data: { articleId: created.id } });
    return created;
  });

  return NextResponse.json({ article }, { status: 201 });
}
