import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";
import { isCloudinaryConfigured, isManagedUrl } from "@/lib/uploads";

const MAX_IMAGES = 5;

const submitSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  documentUrl: z.string().url(),
  documentName: z.string().trim().min(1).max(200),
  imageUrls: z.array(z.string().url()).max(MAX_IMAGES).default([]),
  // Skjult felt ingen ekte bruker fyller ut - roboter gjør det ofte.
  website: z.string().max(0).optional().or(z.literal("")),
});

/**
 * Offentlig, ikke-innlogget innsendingsskjema (/send-inn). Filene lastes opp
 * direkte fra nettleseren til Cloudinary (se SubmissionForm) - her lagres
 * kun URL-ene, slik at store Word-/PDF-filer og bilder ikke må gjennom
 * Vercels egen (mye lavere) grense for forespørselsstørrelse.
 */
export async function POST(req: NextRequest) {
  const parsed = submitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig innsending. Sjekk at alle påkrevde felt er fylt ut." }, { status: 400 });
  }
  const { name, email, message, documentUrl, documentName, imageUrls, website } = parsed.data;

  // Honeypot: en ekte bruker ser aldri dette feltet. Late som det gikk bra
  // uten å lagre noe, i stedet for å avsløre for roboten at den ble tatt.
  if (website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (isCloudinaryConfigured() && (!isManagedUrl(documentUrl) || imageUrls.some((url) => !isManagedUrl(url)))) {
    return NextResponse.json({ error: "Ugyldig fil-URL." }, { status: 400 });
  }

  const submission = await prisma.submission.create({
    data: {
      name,
      email: email || null,
      message: message || null,
      documentUrl,
      documentName,
      imageUrls,
    },
  });

  return NextResponse.json({ ok: true, id: submission.id }, { status: 201 });
}

/** Redaktør/admin: liste over innsendte bidrag, nyeste først. */
export async function GET() {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const submissions = await prisma.submission.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ submissions });
}
