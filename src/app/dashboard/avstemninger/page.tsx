import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canApproveArticles } from "@/lib/permissions";
import { PollAdminPanel } from "@/components/dashboard/PollAdminPanel";

export default async function AvstemningerPage() {
  const session = await getServerSession(authOptions);
  if (!canApproveArticles(session?.user?.role)) redirect("/dashboard");

  const polls = await prisma.poll.findMany({
    orderBy: { createdAt: "desc" },
    include: { options: { orderBy: { sortOrder: "asc" }, include: { _count: { select: { votes: true } } } } },
  });

  const pollsForPanel = polls.map((poll) => ({
    id: poll.id,
    question: poll.question,
    isOpen: poll.isOpen,
    options: poll.options.map((o) => ({ id: o.id, label: o.label, votes: o._count.votes })),
  }));

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-ink">Avstemninger</h1>
      <p className="mt-2 font-serif text-muted">
        Opprett avstemninger som vises offentlig på <code>/avstemning</code>. Alle kan stemme uten å
        logge inn (én stemme per nettleser) - ingen AI eller betalt tjeneste er involvert.
      </p>
      <div className="mt-6">
        <PollAdminPanel polls={pollsForPanel} />
      </div>
    </div>
  );
}
