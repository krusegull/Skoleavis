import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/apiAuth";
import { canCreateDrafts } from "@/lib/permissions";
import { isCloudinaryConfigured, uploadFile } from "@/lib/uploads";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/** Laster opp et bilde (til artikler eller "Om oss"-siden) og returnerer en offentlig URL. */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !canCreateDrafts(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  if (!isCloudinaryConfigured()) {
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
    return NextResponse.json({ error: "Bildet er for stort (maks 10 MB)" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(buffer);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Feil ved opplasting til Cloudinary:", err);
    return NextResponse.json({ error: "Kunne ikke laste opp bildet akkurat nå." }, { status: 502 });
  }
}
