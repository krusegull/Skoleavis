"use client";

/**
 * Direkte, usignert opplasting fra nettleseren til Cloudinary - brukes av
 * det offentlige innsendingsskjemaet (/send-inn) slik at store Word-/PDF-
 * filer og bilder ikke må innom vår egen server (Vercel har en langt lavere
 * grense for hvor stor en forespørsel til en funksjon kan være enn det
 * Cloudinary tillater direkte). Krever at en "unsigned upload preset" er
 * satt opp i Cloudinary-kontoen, se README "Innsending fra elever".
 */

export function isClientUploadConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
}

export async function uploadFileFromBrowser(
  file: File,
  folder: string
): Promise<{ url: string; name: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Filopplasting er ikke satt opp på denne installasjonen ennå.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error("Opplastingen feilet. Prøv igjen, eller bruk en mindre fil.");
  }
  const data = await res.json();
  return { url: data.secure_url as string, name: file.name };
}
