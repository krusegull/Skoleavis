import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canApproveArticles } from "@/lib/permissions";
import { CrosswordAdminPanel } from "@/components/dashboard/CrosswordAdminPanel";

export default async function KryssordAdminPage() {
  const session = await getServerSession(authOptions);
  if (!canApproveArticles(session?.user?.role)) redirect("/dashboard");

  const crosswords = await prisma.crossword.findMany({
    orderBy: { createdAt: "desc" },
    include: { words: true },
  });

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-ink">Kryssord</h1>
      <p className="mt-2 font-serif text-muted">
        Opprett kryssord som vises offentlig på <code>/kryssord</code>. Besøkende løser dem direkte på
        siden - ingen nedlasting, ingen AI eller betalt tjeneste er involvert.
      </p>
      <div className="mt-6">
        <CrosswordAdminPanel crosswords={crosswords} />
      </div>
    </div>
  );
}
