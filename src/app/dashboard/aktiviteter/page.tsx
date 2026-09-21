import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canApproveArticles } from "@/lib/permissions";
import { LocalActivityAdminPanel } from "@/components/dashboard/LocalActivityAdminPanel";

export default async function AktiviteterAdminPage() {
  const session = await getServerSession(authOptions);
  if (!canApproveArticles(session?.user?.role)) redirect("/dashboard");

  const activities = await prisma.localActivity.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-ink">Aktiviteter i nærområdet</h1>
      <p className="mt-2 font-serif text-muted">
        Fritidstilbud som vises offentlig på <code>/aktiviteter</code>, gruppert etter kategori. Kort
        tekst her + en lenke videre til tilbudets egen side.
      </p>
      <div className="mt-6">
        <LocalActivityAdminPanel activities={activities} />
      </div>
    </div>
  );
}
