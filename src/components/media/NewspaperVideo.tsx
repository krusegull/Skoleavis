"use client";

/**
 * Video slik leserne ser den. Er `muted` satt av redaksjonen, spilles den
 * alltid uten lyd: lyden slås av igjen med en gang om noen prøver å skru den
 * på via avspillingskontrollene. Ren nettleserlogikk - ingen ekstra
 * Cloudinary-behandling eller kostnad.
 */
export function NewspaperVideo({ src, muted, className }: { src: string; muted: boolean; className?: string }) {
  return (
    <video
      src={src}
      controls
      playsInline
      preload="metadata"
      muted={muted}
      onVolumeChange={
        muted
          ? (e) => {
              if (!e.currentTarget.muted) e.currentTarget.muted = true;
            }
          : undefined
      }
      className={className}
    />
  );
}
