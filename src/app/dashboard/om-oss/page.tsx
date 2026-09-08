import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canApproveArticles } from "@/lib/permissions";
import { getOrCreateAboutPage } from "@/lib/about";
import { AboutPageForm } from "@/components/dashboard/AboutPageForm";

export default async function OmOssDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!canApproveArticles(session?.user?.role)) redirect("/dashboard");

  const about = await getOrCreateAboutPage();

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-ink">Om oss-siden</h1>
      <p className="mt-2 font-serif text-muted">
        Innhold som vises på den offentlige "Om oss"-siden - f.eks. informasjon om skolen og redaksjonen.
      </p>
      <div className="mt-6">
        <AboutPageForm initial={about} />
      </div>
    </div>
  );
}
