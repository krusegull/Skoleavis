import Image from "next/image";
import { getOrCreateAboutPage } from "@/lib/about";

export const revalidate = 60;

export default async function OmOssPage() {
  const about = await getOrCreateAboutPage();
  const paragraphs = about.body.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="rule-thick border-ink pb-2 font-headline text-4xl font-bold text-ink">
        {about.title}
      </h1>

      {about.imageUrl && (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden bg-ink/10">
          <Image src={about.imageUrl} alt={about.title} fill className="object-cover" />
        </div>
      )}

      <div className="prose-article mt-8">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => <p key={i}>{p}</p>)
        ) : (
          <p className="text-muted">Denne siden er ikke fylt ut ennå.</p>
        )}
      </div>
    </div>
  );
}
