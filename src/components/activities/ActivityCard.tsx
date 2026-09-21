import { LocalActivity } from "@prisma/client";

export function ActivityCard({ activity }: { activity: LocalActivity }) {
  return (
    <div className="flex h-full flex-col border border-ink/20 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-headline text-lg font-bold text-ink">{activity.name}</h3>
        {activity.ageRange && (
          <span className="shrink-0 border border-ink/30 px-2 py-0.5 font-sans text-xs uppercase tracking-wide text-muted">
            {activity.ageRange}
          </span>
        )}
      </div>
      <p className="mt-2 flex-1 font-serif text-sm text-ink/80">{activity.description}</p>
      <a
        href={activity.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block font-sans text-sm font-semibold text-accent hover:underline"
      >
        Les mer →
      </a>
    </div>
  );
}
