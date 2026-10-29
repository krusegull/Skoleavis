import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";
import { deleteUploadedFile } from "@/lib/uploads";

const patchSchema = z.object({
  isOpen: z.boolean().optional(),
  videoUrl: z.string().url().nullable().or(z.literal("")).optional(),
  videoMuted: z.boolean().optional(),
});

/** Redaktør/admin: åpne/lukke en avstemning, eller legge til/bytte/fjerne video. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const existing = await prisma.poll.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Fant ikke avstemningen" }, { status: 404 });

  const videoProvided = parsed.data.videoUrl !== undefined;
  const nextVideoUrl = videoProvided ? parsed.data.videoUrl || null : undefined;

  const poll = await prisma.poll.update({
    where: { id: params.id },
    data: { isOpen: parsed.data.isOpen, videoUrl: nextVideoUrl, videoMuted: parsed.data.videoMuted },
  });

  // Rydder bort den gamle videoen fra Cloudinary når den byttes ut eller fjernes.
  if (videoProvided && existing.videoUrl && existing.videoUrl !== nextVideoUrl) {
    await deleteUploadedFile(existing.videoUrl);
  }
  return NextResponse.json({ poll });
}

/** Redaktør/admin: slett en avstemning (og alle stemmer på den). */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const poll = await prisma.poll.delete({ where: { id: params.id } });
  await deleteUploadedFile(poll.videoUrl);
  return NextResponse.json({ ok: true });
}
