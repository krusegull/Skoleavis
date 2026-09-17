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
  const match = url.match(/\/(image|video|raw)\/upload\/(?:v\d+\/)?([^?]+)/);
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
