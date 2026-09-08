import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentRoster } from "@/lib/schoolYear";
import { ArticleForm } from "@/components/dashboard/ArticleForm";

export default async function NySakPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) return null;

  const roster = await getCurrentRoster();

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-ink">Ny sak</h1>
      <div className="mt-6">
        <ArticleForm
          initialArticle={null}
          roster={roster}
          currentUser={{ id: session.user.id, name: session.user.name ?? "", role: session.user.role }}
        />
      </div>
    </div>
  );
}
