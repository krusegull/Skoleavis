import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canApproveArticles } from "@/lib/permissions";
import { SubmissionList } from "@/components/dashboard/SubmissionList";

export default async function InnsendingerPage() {
  const session = await getServerSession(authOptions);
  if (!canApproveArticles(session?.user?.role)) redirect("/dashboard");

  const submissions = await prisma.submission.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-ink">Innsendinger</h1>
      <p className="mt-2 font-serif text-muted">
        Bidrag sendt inn av elever og andre via det offentlige innsendingsskjemaet
        (stuanytt.../send-inn). Last ned dokumentet, skriv saken inn i systemet som en vanlig
        kladd dersom den skal publiseres, og merk bidraget som lest eller arkiver det.
      </p>
      <div className="mt-6">
        <SubmissionList submissions={submissions} />
      </div>
    </div>
  );
}
