import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSessionUser } from "@/lib/apiAuth";
import { canCreateDrafts } from "@/lib/permissions";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

/** Laster opp et bilde (til artikler eller "Om oss"-siden) og returnerer en offentlig URL. */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !canCreateDrafts(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  // @vercel/blob kan autentisere enten via BLOB_READ_WRITE_TOKEN, eller via
  // Vercels OIDC-token sammen med BLOB_STORE_ID (nyere "private" Blob-lagre).
  const hasBlobCredentials =
    Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
    (Boolean(process.env.VERCEL_OIDC_TOKEN) && Boolean(process.env.BLOB_STORE_ID));

  if (!hasBlobCredentials) {
    return NextResponse.json(
      { error: "Bildeopplasting er ikke satt opp på denne installasjonen ennå. Bruk en bilde-URL i stedet." },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ingen fil mottatt" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Filen må være et bilde" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Bildet er for stort (maks 8 MB)" }, { status: 400 });
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";

  try {
    const blob = await put(`bilder/${user.id}-${Date.now()}.${extension}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Feil ved opplasting til Vercel Blob:", err);
    return NextResponse.json({ error: "Kunne ikke laste opp bildet akkurat nå." }, { status: 502 });
  }
}
