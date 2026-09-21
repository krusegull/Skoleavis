import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { VOTER_COOKIE } from "@/lib/polls";
import { PollVoteForm } from "@/components/polls/PollVoteForm";
import { PollResults } from "@/components/polls/PollResults";

export const dynamic = "force-dynamic";

export default async function AvstemningPage() {
  const polls = await prisma.poll.findMany({
    orderBy: { createdAt: "desc" },
    include: { options: { orderBy: { sortOrder: "asc" }, include: { _count: { select: { votes: true } } } } },
  });

  const voterKey = cookies().get(VOTER_COOKIE)?.value;
  const votedPollIds = new Set(
    voterKey
      ? (
          await prisma.vote.findMany({
            where: { voterKey, pollId: { in: polls.map((p) => p.id) } },
            select: { pollId: true },
          })
        ).map((v) => v.pollId)
      : []
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="rule-thick border-ink pb-2 font-headline text-4xl font-bold text-ink">Avstemning</h1>
      <p className="mt-4 font-serif text-ink/80">
        Vær med og stem! Du kan stemme én gang per avstemning fra denne enheten.
      </p>

      {polls.length === 0 && <p className="mt-8 font-serif text-muted">Ingen avstemninger akkurat nå.</p>}

      <div className="mt-8 space-y-10">
        {polls.map((poll) => {
          const options = poll.options.map((o) => ({ id: o.id, label: o.label, votes: o._count.votes }));
          const hasVoted = votedPollIds.has(poll.id);
          return (
            <div key={poll.id} className="border border-ink/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-headline text-2xl font-bold text-ink">{poll.question}</h2>
                {!poll.isOpen && (
                  <span className="shrink-0 border border-ink/30 px-2 py-0.5 font-sans text-xs uppercase tracking-wide text-muted">
                    Stengt
                  </span>
                )}
              </div>
              <div className="mt-4">
                {poll.isOpen && !hasVoted ? (
                  <PollVoteForm pollId={poll.id} options={options} />
                ) : (
                  <PollResults options={options} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
