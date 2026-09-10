import { getOrCreateAboutPage } from "@/lib/about";
import { ensureRichTextHtml } from "@/lib/richTextCompat";

export const revalidate = 60;

export default async function OmOssPage() {
  const about = await getOrCreateAboutPage();
  const bodyHtml = ensureRichTextHtml(about.body);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="rule-thick border-ink pb-2 font-headline text-4xl font-bold text-ink">
        {about.title}
      </h1>

      {about.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={about.imageUrl}
          alt={about.title}
          className="mt-6 h-auto w-full bg-ink/10"
        />
      )}

      {bodyHtml ? (
        <div className="prose-article mt-8" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      ) : (
        <p className="mt-8 text-muted">Denne siden er ikke fylt ut ennå.</p>
      )}
    </div>
  );
}
