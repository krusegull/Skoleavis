import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles, canCreateDrafts } from "@/lib/permissions";
import { sanitizeRichText } from "@/lib/sanitize";
import { Category, ArticleStatus } from "@prisma/client";

const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  ingress: z.string().min(1).max(500),
  teaser: z.string().max(300).optional().nullable(),
  body: z.string().min(1),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  category: z.nativeEnum(Category),
});

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine") === "true";
  const status = searchParams.get("status") as ArticleStatus | null;

  if (status === ArticleStatus.PENDING_REVIEW && !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  // Uten "mine" eller "status" ville spørringen returnere alle saker i hele
  // systemet, inkludert andres upubliserte kladder. Det får bare
  // redaktør/admin gjøre - alle andre skoperes automatisk til egne saker.
  const scopeToOwn = !mine && !status && !canApproveArticles(user.role);

  const articles = await prisma.article.findMany({
    where: {
      ...(mine || scopeToOwn ? { authorId: user.id } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      author: { select: { id: true, name: true } },
      contributors: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ articles });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !canCreateDrafts(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createArticleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const article = await prisma.article.create({
    data: {
      title: parsed.data.title,
      ingress: parsed.data.ingress,
      teaser: parsed.data.teaser || null,
      body: sanitizeRichText(parsed.data.body),
      imageUrl: parsed.data.imageUrl || null,
      category: parsed.data.category,
      authorId: user.id,
      status: ArticleStatus.DRAFT,
    },
  });

  return NextResponse.json({ article }, { status: 201 });
}
