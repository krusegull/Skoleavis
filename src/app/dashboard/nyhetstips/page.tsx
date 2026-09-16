import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canApproveArticles } from "@/lib/permissions";
import { NewsTipList } from "@/components/dashboard/NewsTipList";
import { RunNewsTipsNowButton } from "@/components/dashboard/RunNewsTipsNowButton";

export default async function NyhetstipsPage() {
  const session = await getServerSession(authOptions);
  if (!canApproveArticles(session?.user?.role)) redirect("/dashboard");

  const tips = await prisma.newsTip.findMany({
    where: { dismissed: false, articleId: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-ink">Nyhetstips</h1>
      <p className="mt-2 font-serif text-muted">
        En AI-agent søker gjennom troverdige nyhetskilder hver torsdag og foreslår saker som kan
        være aktuelle for elevene - med vekt på Stovner/Østkanten i Oslo og store nasjonale
        nyheter. Velg om Claude skal skrive et førsteutkast (original tekst, aldri kopiert fra
        kilden - må alltid leses gjennom og faktasjekkes), eller om redaksjonen skriver selv fra
        bunnen av.
      </p>
      <RunNewsTipsNowButton />
      <div className="mt-6">
        <NewsTipList tips={tips} />
      </div>
    </div>
  );
}
