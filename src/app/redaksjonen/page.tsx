import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS, ROLE_ORDER } from "@/lib/constants";

export const revalidate = 60;

export default async function RedaksjonenPage({
  searchParams,
}: {
  searchParams: { ar?: string };
}) {
  const schoolYears = await prisma.schoolYear.findMany({ orderBy: { createdAt: "desc" } });
  const current = schoolYears.find((y) => y.isCurrent) ?? schoolYears[0];
  const selected = schoolYears.find((y) => y.id === searchParams.ar) ?? current;

  if (!selected) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-serif text-muted">Ingen skoleår er satt opp ennå.</p>
      </div>
    );
  }

  const isCurrentYear = selected.id === current?.id;

  const assignments = await prisma.roleAssignment.findMany({
    where: {
      schoolYearId: selected.id,
      ...(isCurrentYear ? { user: { active: true } } : {}),
    },
    include: { user: true },
  });

  const byRole = new Map<string, typeof assignments>();
  for (const role of ROLE_ORDER) byRole.set(role, []);
  for (const a of assignments) {
    byRole.get(a.role)?.push(a);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="rule-thick border-ink pb-2 font-headline text-4xl font-bold text-ink">Redaksjonen</h1>
      <p className="mt-2 font-serif text-muted">
        {isCurrentYear ? "Gjeldende redaksjon" : "Tidligere redaksjon"} - skoleåret {selected.label}
      </p>

      {schoolYears.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {schoolYears.map((year) => (
            <Link
              key={year.id}
              href={`/redaksjonen?ar=${year.id}`}
              className={`border px-3 py-1 font-sans text-xs uppercase tracking-wide ${
                year.id === selected.id
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/30 text-muted hover:border-ink"
              }`}
            >
              {year.label}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {ROLE_ORDER.map((role) => {
          const members = byRole.get(role) ?? [];
          if (members.length === 0) return null;
          return (
            <div key={role}>
              <h2 className="section-label border-b border-ink/30 pb-1">{ROLE_LABELS[role]}</h2>
              <ul className="mt-2 space-y-1 font-serif text-ink">
                {members.map((m) => (
                  <li key={m.id}>{m.user.name}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <p className="mt-8 font-serif text-muted">Ingen registrerte redaksjonsmedlemmer for dette skoleåret.</p>
      )}
    </div>
  );
}
