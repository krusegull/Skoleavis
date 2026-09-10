import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles, canEditArticle } from "@/lib/permissions";
import { deleteUploadedFile } from "@/lib/uploads";
import { sanitizeRichText } from "@/lib/sanitize";
import { ArticleStatus, Category, Role } from "@prisma/client";

const contributorSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(120),
  role: z.nativeEnum(Role),
});

const updateArticleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  ingress: z.string().min(1).max(500).optional(),
  teaser: z.string().max(300).optional().nullable(),
  body: z.string().min(1).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  category: z.nativeEnum(Category).optional(),
  contributors: z.array(contributorSchema).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { contributors: true, author: { select: { id: true, name: true } } },
  });
  if (!article) return NextResponse.json({ error: "Fant ikke saken" }, { status: 404 });

  if (!canEditArticle(user.role, article.authorId, user.id) && article.status !== ArticleStatus.PUBLISHED) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  return NextResponse.json({ article });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return NextResponse.json({ error: "Fant ikke saken" }, { status: 404 });

  if (!canEditArticle(user.role, article.authorId, user.id)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }
  if (article.status === ArticleStatus.PUBLISHED && !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Publiserte saker kan kun redigeres av redaktør/admin" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateArticleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { contributors, ...fields } = parsed.data;
  if (fields.body !== undefined) {
    fields.body = sanitizeRichText(fields.body);
  }

  // Skiller "feltet ble ikke sendt med" (la stå urørt) fra "feltet ble sendt
  // som tomt/null" (fjern bildet) - ellers er det umulig å fjerne et bilde
  // uten å slette hele saken.
  const imageUrlProvided = Object.prototype.hasOwnProperty.call(parsed.data, "imageUrl");
  const nextImageUrl = imageUrlProvided ? fields.imageUrl || null : undefined;

  // Hvis forfatteren redigerer en avvist sak, sender vi den tilbake til kladd
  // slik at den følger normal godkjenningsflyt på nytt.
  const statusUpdate =
    article.status === ArticleStatus.REJECTED && article.authorId === user.id
      ? { status: ArticleStatus.DRAFT, rejectionReason: null }
      : {};

  const updated = await prisma.$transaction(async (tx) => {
    if (contributors) {
      await tx.articleContributor.deleteMany({ where: { articleId: article.id } });
      await tx.articleContributor.createMany({
        data: contributors.map((c, i) => ({
          articleId: article.id,
          userId: c.userId,
          nameSnapshot: c.name,
          roleSnapshot: c.role,
          sortOrder: i,
        })),
      });
    }

    return tx.article.update({
      where: { id: article.id },
      data: {
        ...fields,
        imageUrl: nextImageUrl,
        ...statusUpdate,
      },
      include: { contributors: true },
    });
  });

  // Rydder opp det gamle bildet fra fillagringen dersom det ble erstattet
  // eller fjernet, slik at det ikke blir liggende offentlig tilgjengelig.
  if (imageUrlProvided && article.imageUrl && article.imageUrl !== nextImageUrl) {
    await deleteUploadedFile(article.imageUrl);
  }

  return NextResponse.json({ article: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return NextResponse.json({ error: "Fant ikke saken" }, { status: 404 });

  const isOwnDraft = article.authorId === user.id && article.status === ArticleStatus.DRAFT;
  if (!isOwnDraft && !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  await prisma.article.delete({ where: { id: article.id } });
  await deleteUploadedFile(article.imageUrl);
  return NextResponse.json({ ok: true });
}
