import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 30;

export default async function KryssordListePage() {
  const crosswords = await prisma.crossword.findMany({
    where: { isOpen: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { words: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="rule-thick border-ink pb-2 font-headline text-4xl font-bold text-ink">Kryssord</h1>
      <p className="mt-4 font-serif text-ink/80">Løs kryssordene direkte på siden - ingen nedlasting nødvendig.</p>

      {crosswords.length === 0 && <p className="mt-8 font-serif text-muted">Ingen kryssord akkurat nå.</p>}

      <ul className="mt-8 divide-y divide-ink/20">
        {crosswords.map((cw) => (
          <li key={cw.id} className="py-4">
            <Link href={`/kryssord/${cw.id}`} className="group block">
              <h2 className="font-headline text-xl font-bold text-ink group-hover:text-accent">{cw.title}</h2>
              {cw.intro && <p className="mt-1 font-serif text-ink/80">{cw.intro}</p>}
              <span className="mt-1 block font-sans text-xs text-muted">{cw._count.words} ord</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
