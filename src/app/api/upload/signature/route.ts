import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSessionUser } from "@/lib/apiAuth";
import { canCreateDrafts } from "@/lib/permissions";
import { isCloudinaryConfigured } from "@/lib/uploads";

/**
 * Utsteder en signert Cloudinary-opplastingstillatelse til nettleseren, slik
 * at store filer (video) kan lastes opp direkte dit uten å gå innom vår egen
 * Vercel-funksjon (som har en mye lavere grense for forespørselsstørrelse).
 * I motsetning til en "unsigned upload preset" (brukt av /send-inn) krever
 * dette innlogging - signaturen kan kun hentes av Redaktør/Admin/Journalist
 * osv., ikke av en anonym besøkende.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user || !canCreateDrafts(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Opplasting er ikke satt opp på denne installasjonen ennå." },
      { status: 503 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "skoleavisen";
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET!);

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
