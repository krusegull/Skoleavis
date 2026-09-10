import { del } from "@vercel/blob";

/**
 * Best-effort sletting av et tidligere opplastet bilde fra Blob-lagringen.
 * Feiler stille dersom URL-en ikke peker til vår egen lagring (f.eks. en
 * ekstern URL noen limte inn manuelt) eller dersom Blob ikke er satt opp.
 */
export async function deleteBlobIfManaged(url: string | null | undefined) {
  if (!url || !url.includes(".blob.vercel-storage.com")) return;
  try {
    await del(url);
  } catch (err) {
    console.error("Kunne ikke slette bilde fra Blob-lagring:", err);
  }
}
