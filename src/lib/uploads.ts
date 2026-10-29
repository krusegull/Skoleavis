import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
  );
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/** Sant dersom URL-en peker til vår egen Cloudinary-konto (ikke en vilkårlig ekstern URL). */
export function isManagedUrl(url: string): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  return Boolean(cloudName) && url.includes(`res.cloudinary.com/${cloudName}/`);
}

type CloudinaryResourceType = "image" | "video" | "raw";

/**
 * .../<resource_type>/upload/v1699999999/skoleavisen/abc123.jpg
 * -> { resourceType: "image", publicId: "skoleavisen/abc123" }
 * Raw files (Word/PDF osv.) beholder filendelsen som en del av public_id-en
 * hos Cloudinary, så den strippes kun for image/video.
 */
function parseCloudinaryUrl(url: string): { publicId: string; resourceType: CloudinaryResourceType } | null {
  // URL-er med transformasjoner (f.eks. .../upload/e_upscale/c_limit,w_2400/v123/skoleavisen/abc.jpg)
  // har alltid versjonsnummeret rett før public_id - bruk det som anker når det finnes.
  const match =
    url.match(/\/(image|video|raw)\/upload\/(?:[^?]*?\/)?v\d+\/([^?]+)/) ??
    url.match(/\/(image|video|raw)\/upload\/(?:v\d+\/)?([^?]+)/);
  if (!match) return null;
  const resourceType = match[1] as CloudinaryResourceType;
  const publicId = resourceType === "raw" ? match[2] : match[2].replace(/\.[a-zA-Z0-9]+$/, "");
  return { publicId, resourceType };
}

/**
 * Laster opp en fil (bilde, video eller dokument) til Cloudinary og
 * returnerer en offentlig URL.
 */
export async function uploadFile(buffer: Buffer): Promise<string> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "skoleavisen", resource_type: "auto" },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Ukjent feil ved opplasting"));
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

/** Bilder smalere enn dette forstørres automatisk med AI ved opplasting. */
export const UPSCALE_BELOW_WIDTH = 1200;
/** Cloudinarys grense for AI-forstørring (e_upscale): under 4,2 megapiksler inn. */
const UPSCALE_MAX_INPUT_PIXELS = 4_200_000;
/**
 * Forstørrer 4x med AI, begrenser til 2400 px bredde (rikelig for full
 * skjermbredde, også på skarpe skjermer) og lagrer i høy kvalitet.
 */
const UPSCALE_TRANSFORMATION = "e_upscale/c_limit,w_2400/q_auto:best";
/** Vercel-funksjoner kuttes etter ~10 s - gi opp forstørringen i god tid før det. */
const UPSCALE_TIMEOUT_MS = 7000;

/**
 * Laster opp et bilde. Er bildet lite (under 1200 px bredt), lages i tillegg
 * en AI-forstørret, skarpere versjon hos Cloudinary, og URL-en til den
 * returneres i stedet for originalen.
 *
 * Kostnad: forstørringen gjøres ÉN gang per opplastet bilde (lagres ferdig
 * hos Cloudinary), aldri per visning - og bare av innloggede
 * redaksjonsmedlemmer. Feiler den (f.eks. tidsavbrudd, eller at funksjonen
 * ikke er tilgjengelig på kontoen), brukes originalbildet som før.
 */
export async function uploadImage(buffer: Buffer): Promise<{ url: string; upscaled: boolean; width: number }> {
  configureCloudinary();

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
    version: number;
    format: string;
    width: number;
    height: number;
    pages?: number;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "skoleavisen", resource_type: "image" },
      (error, res) => {
        if (error || !res) reject(error ?? new Error("Ukjent feil ved opplasting"));
        else resolve(res as never);
      }
    );
    uploadStream.end(buffer);
  });

  const isSmall = result.width < UPSCALE_BELOW_WIDTH;
  const fitsUpscaleLimit = result.width * result.height < UPSCALE_MAX_INPUT_PIXELS;
  const isAnimated = result.format === "gif" || (result.pages ?? 1) > 1;
  if (!isSmall || !fitsUpscaleLimit || isAnimated) {
    return { url: result.secure_url, upscaled: false, width: result.width };
  }

  try {
    const explicit = cloudinary.uploader.explicit(result.public_id, {
      type: "upload",
      eager: [{ raw_transformation: UPSCALE_TRANSFORMATION }],
    });
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Tidsavbrudd ved AI-forstørring")), UPSCALE_TIMEOUT_MS)
    );
    const res = (await Promise.race([explicit, timeout])) as { eager?: { secure_url?: string; status?: string }[] };
    const eager = res.eager?.[0];
    if (!eager?.secure_url || (eager.status && eager.status !== "processed")) {
      return { url: result.secure_url, upscaled: false, width: result.width };
    }
    return { url: eager.secure_url, upscaled: true, width: result.width };
  } catch (err) {
    console.error("AI-forstørring feilet, bruker originalbildet:", err);
    return { url: result.secure_url, upscaled: false, width: result.width };
  }
}

/**
 * Best-effort sletting av en tidligere opplastet fil fra Cloudinary.
 * Feiler stille dersom URL-en ikke peker til vår egen lagring (f.eks. en
 * ekstern URL noen limte inn manuelt) eller dersom Cloudinary ikke er satt
 * opp.
 */
export async function deleteUploadedFile(url: string | null | undefined) {
  if (!url || !isCloudinaryConfigured() || !isManagedUrl(url)) return;

  const parsed = parseCloudinaryUrl(url);
  if (!parsed) return;

  try {
    configureCloudinary();
    await cloudinary.uploader.destroy(parsed.publicId, { resource_type: parsed.resourceType });
  } catch (err) {
    console.error("Kunne ikke slette fil fra Cloudinary:", err);
  }
}
