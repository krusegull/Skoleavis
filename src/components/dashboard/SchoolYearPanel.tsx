"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SchoolYear, User, RoleAssignment } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/constants";

type AssignmentWithUser = RoleAssignment & { user: User };

export function SchoolYearPanel({
  schoolYears,
  assignmentsByYear,
}: {
  schoolYears: SchoolYear[];
  assignmentsByYear: Record<string, AssignmentWithUser[]>;
}) {
  const router = useRouter();

  const [newLabel, setNewLabel] = useState("");
  const [makeCurrent, setMakeCurrent] = useState(true);
  const [creating, setCreating] = useState(false);

  const [endYearId, setEndYearId] = useState(
    schoolYears.find((y) => y.isCurrent)?.id ?? schoolYears[0]?.id ?? ""
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [ending, setEnding] = useState(false);
  const [busy, setBusy] = useState(false);

  const activeMembers = useMemo(
    () => (assignmentsByYear[endYearId] ?? []).filter((a) => a.user.active),
    [assignmentsByYear, endYearId]
  );

  function toggle(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(activeMembers.map((a) => a.userId)));
  }

  async function createSchoolYear(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/school-years", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label: newLabel, makeCurrent }),
    });
    setCreating(false);
    setNewLabel("");
    router.refresh();
  }

  async function setCurrent(id: string) {
    setBusy(true);
    await fetch(`/api/school-years/${id}/set-current`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  async function endSchoolYear() {
    if (selected.size === 0) return;
    if (!confirm(`Deaktivere ${selected.size} valgte kontoer? Dette kan endres tilbake manuelt senere.`)) return;
    setEnding(true);
    await fetch(`/api/school-years/${endYearId}/end`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userIds: Array.from(selected) }),
    });
    setEnding(false);
    setSelected(new Set());
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="section-label border-b border-ink/30 pb-1">Skoleår</h2>
        <ul className="mt-4 space-y-2">
          {schoolYears.map((year) => (
            <li key={year.id} className="flex items-center justify-between border border-ink/20 bg-white px-3 py-2">
              <span className="font-serif text-ink">{year.label}</span>
              {year.isCurrent ? (
                <span className="font-sans text-xs uppercase tracking-wide text-accent">Gjeldende</span>
              ) : (
                <button
                  disabled={busy}
                  onClick={() => setCurrent(year.id)}
                  className="border border-ink px-2 py-1 font-sans text-xs uppercase tracking-wide hover:bg-ink hover:text-paper disabled:opacity-50"
                >
                  Sett som gjeldende
                </button>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={createSchoolYear} className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-muted">Nytt skoleår</label>
            <input
              required
              placeholder="f.eks. 2027/2028"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="mt-1 border border-ink/30 bg-white px-3 py-2 font-serif text-sm"
            />
          </div>
          <label className="flex items-center gap-2 font-sans text-xs uppercase tracking-wide text-muted">
            <input type="checkbox" checked={makeCurrent} onChange={(e) => setMakeCurrent(e.target.checked)} />
            Sett som gjeldende
          </label>
          <button
            type="submit"
            disabled={creating}
            className="border border-ink bg-ink px-3 py-2 font-sans text-xs uppercase tracking-wide text-paper hover:bg-accent hover:border-accent disabled:opacity-50"
          >
            {creating ? "Oppretter…" : "Opprett skoleår"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="section-label border-b border-ink/30 pb-1">Avslutt skoleår</h2>
        <p className="mt-2 font-serif text-sm text-muted">
          Velg skoleår og kryss av kontoene som skal deaktiveres (f.eks. elever/redaksjonsmedlemmer som slutter).
          Dette skjer aldri automatisk - kun når du bekrefter det her.
        </p>

        <div className="mt-4">
          <select
            value={endYearId}
            onChange={(e) => {
              setEndYearId(e.target.value);
              setSelected(new Set());
            }}
            className="border border-ink/30 bg-white px-3 py-2 font-serif text-sm"
          >
            {schoolYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label}
              </option>
            ))}
          </select>
        </div>

        {activeMembers.length === 0 ? (
          <p className="mt-4 font-serif text-muted">Ingen aktive kontoer registrert for dette skoleåret.</p>
        ) : (
          <>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={selectAll} className="font-sans text-xs uppercase tracking-wide text-accent hover:underline">
                Velg alle
              </button>
              <span className="font-sans text-xs text-muted">{selected.size} valgt</span>
            </div>
            <ul className="mt-2 divide-y divide-ink/10 border border-ink/20 bg-white">
              {activeMembers.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-3 py-2">
                  <input type="checkbox" checked={selected.has(a.userId)} onChange={() => toggle(a.userId)} />
                  <span className="font-serif text-ink">{a.user.name}</span>
                  <span className="font-sans text-xs uppercase tracking-wide text-muted">{ROLE_LABELS[a.role]}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={endSchoolYear}
              disabled={ending || selected.size === 0}
              className="mt-4 border border-accent bg-accent px-4 py-2 font-sans text-sm uppercase tracking-wide text-paper hover:opacity-90 disabled:opacity-50"
            >
              {ending ? "Deaktiverer…" : "Deaktiver valgte kontoer"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
