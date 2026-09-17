import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";
import { deleteUploadedFile } from "@/lib/uploads";
import { SubmissionStatus } from "@prisma/client";

const patchSchema = z.object({ status: z.nativeEnum(SubmissionStatus) });

/** Redaktør/admin: merk et innsendt bidrag som lest/arkivert. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig status" }, { status: 400 });
  }

  const submission = await prisma.submission.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ submission });
}

/** Redaktør/admin: slett et innsendt bidrag, inkludert opplastede filer. */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const submission = await prisma.submission.findUnique({ where: { id: params.id } });
  if (!submission) return NextResponse.json({ error: "Fant ikke bidraget" }, { status: 404 });

  await prisma.submission.delete({ where: { id: params.id } });
  await deleteUploadedFile(submission.documentUrl);
  await Promise.all(submission.imageUrls.map((url: string) => deleteUploadedFile(url)));

  return NextResponse.json({ ok: true });
}
