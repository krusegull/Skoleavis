import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_SLUGS, ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { HeaderAuthLink } from "./HeaderAuthLink";

export async function Header() {
  const session = await getServerSession(authOptions);
  const today = formatDate(new Date());

  return (
    <header className="border-b-4 border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-3 font-sans text-xs uppercase tracking-wide text-muted">
        <span>{today}</span>
        <div className="flex items-center gap-4">
          {session?.user && (
            <span>
              {session.user.name} · {session.user.role ? ROLE_LABELS[session.user.role] : "Ingen rolle"}
            </span>
          )}
          <HeaderAuthLink loggedIn={Boolean(session?.user)} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 text-center">
        <Link href="/">
          <h1 className="font-headline text-5xl font-bold tracking-tight text-masthead sm:text-6xl">
            Skoleavisen
          </h1>
        </Link>
        <p className="mt-1 font-serif italic text-muted">Skrevet av elever, for elever</p>
      </div>

      <nav className="rule-thick rule-thin border-b border-ink">
        <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-2 px-4 py-2 font-sans text-sm uppercase tracking-wide">
          <li>
            <Link href="/" className="hover:text-accent">
              Forside
            </Link>
          </li>
          {CATEGORY_ORDER.map((category) => (
            <li key={category}>
              <Link href={`/kategori/${CATEGORY_SLUGS[category]}`} className="hover:text-accent">
                {CATEGORY_LABELS[category]}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/arkiv" className="hover:text-accent">
              Arkiv
            </Link>
          </li>
          <li>
            <Link href="/redaksjonen" className="hover:text-accent">
              Redaksjonen
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
