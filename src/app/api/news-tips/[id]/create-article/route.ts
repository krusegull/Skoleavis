import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";
import { draftArticleBody } from "@/lib/newsTips";
import { Category, ArticleStatus } from "@prisma/client";

const bodySchema = z.object({ aiDraft: z.boolean().optional() });

/**
 * Redaktør/admin: oppretter en ny kladd basert på et nyhetstips.
 * Ingressen viser alltid kun forslaget til vinkling + kilde. Med
 * `aiDraft: true` skriver Claude i tillegg et førsteutkast til brødtekst
 * (original tekst, aldri kopiert fra kilden) - uten det opprettes en tom
 * kladd redaksjonen skriver selv.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const tip = await prisma.newsTip.findUnique({ where: { id: params.id } });
  if (!tip) return NextResponse.json({ error: "Fant ikke tipset" }, { status: 404 });
  if (tip.articleId) return NextResponse.json({ error: "Det er allerede laget en sak fra dette tipset" }, { status: 400 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  const wantsAiDraft = parsed.success && parsed.data.aiDraft === true;

  let aiBody: string | null = null;
  let aiDraftFailed = false;
  if (wantsAiDraft) {
    aiBody = await draftArticleBody(tip);
    aiDraftFailed = aiBody === null;
  }

  const author = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { name: true } });

  const article = await prisma.$transaction(async (tx) => {
    const created = await tx.article.create({
      data: {
        title: tip.title,
        ingress: `Forslag til vinkling: ${tip.summary}`,
        body: aiBody ?? "",
        aiDrafted: aiBody !== null,
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

  return NextResponse.json({ article, aiDraftFailed }, { status: 201 });
}
