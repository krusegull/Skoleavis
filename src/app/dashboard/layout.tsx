import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canApproveArticles, canManageUsers } from "@/lib/permissions";
import { ROLE_LABELS } from "@/lib/constants";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="md:w-56 md:shrink-0">
          <p className="section-label">Dashbord</p>
          {role && <p className="mt-1 font-serif text-sm text-muted">{ROLE_LABELS[role]}</p>}
          <nav className="mt-4 flex flex-col gap-1 font-sans text-sm">
            <Link href="/dashboard" className="py-1 hover:text-accent">
              Mine kladder
            </Link>
            {canApproveArticles(role) && (
              <Link href="/dashboard/godkjenning" className="py-1 hover:text-accent">
                Til godkjenning
              </Link>
            )}
            {canManageUsers(role) && (
              <>
                <Link href="/dashboard/brukere" className="py-1 hover:text-accent">
                  Brukere
                </Link>
                <Link href="/dashboard/skolear" className="py-1 hover:text-accent">
                  Avslutt skoleår
                </Link>
              </>
            )}
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
