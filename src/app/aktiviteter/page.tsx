import { prisma } from "@/lib/prisma";
import { LOCAL_ACTIVITY_CATEGORY_LABELS, LOCAL_ACTIVITY_CATEGORY_ORDER } from "@/lib/constants";
import { ActivityCard } from "@/components/activities/ActivityCard";

export const revalidate = 60;

export default async function AktiviteterPage() {
  const activities = await prisma.localActivity.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="rule-thick border-ink pb-2 font-headline text-4xl font-bold text-ink">
        Aktiviteter i nærområdet
      </h1>
      <p className="mt-4 max-w-2xl font-serif text-ink/80">
        Fritidstilbud, idrettslag og andre aktiviteter for elever på Stovner og i Groruddalen. Trykk
        "Les mer" for å gå til tilbudets egen nettside.
      </p>

      {activities.length === 0 && (
        <p className="mt-8 font-serif text-muted">Ingen tilbud er lagt inn ennå.</p>
      )}

      <div className="mt-10 space-y-12">
        {LOCAL_ACTIVITY_CATEGORY_ORDER.map((category) => {
          const items = activities.filter((a) => a.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category}>
              <h2 className="section-label">{LOCAL_ACTIVITY_CATEGORY_LABELS[category]}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
