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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Stuanytt" className="h-20 w-20 sm:h-24 sm:w-24" />
        </Link>
        <div className="flex flex-1 flex-col items-center text-center">
          <Link href="/">
            <h1 className="font-headline text-5xl font-bold tracking-tight text-masthead sm:text-6xl">
              Stuanytt
            </h1>
          </Link>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 font-sans text-xs uppercase tracking-wide text-muted">
          <span>{today}</span>
          {session?.user && (
            <span>
              {session.user.name} · {session.user.role ? ROLE_LABELS[session.user.role] : "Ingen rolle"}
            </span>
          )}
          <HeaderAuthLink loggedIn={Boolean(session?.user)} />
        </div>
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
          <li>
            <Link href="/om-oss" className="hover:text-accent">
              Om oss
            </Link>
          </li>
          <li>
            <Link href="/send-inn" className="hover:text-accent">
              Send inn
            </Link>
          </li>
          <li>
            <Link href="/avstemning" className="hover:text-accent">
              Avstemning
            </Link>
          </li>
          <li>
            <Link href="/aktiviteter" className="hover:text-accent">
              Aktiviteter
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
