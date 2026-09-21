"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LocalActivity, LocalActivityCategory } from "@prisma/client";
import { LOCAL_ACTIVITY_CATEGORY_LABELS, LOCAL_ACTIVITY_CATEGORY_ORDER } from "@/lib/constants";

const emptyForm = {
  name: "",
  description: "",
  ageRange: "",
  category: LocalActivityCategory.SPORT as LocalActivityCategory,
  externalUrl: "",
};

export function LocalActivityAdminPanel({ activities }: { activities: LocalActivity[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createActivity() {
    setError(null);
    if (!form.name.trim() || !form.description.trim() || !form.externalUrl.trim()) {
      setError("Fyll ut navn, beskrivelse og lenke.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/local-activities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Kunne ikke legge til tilbudet.");
      return;
    }
    setForm(emptyForm);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Fjerne dette tilbudet permanent?")) return;
    setBusyId(id);
    await fetch(`/api/local-activities/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="border border-ink/20 p-5">
        <h2 className="font-headline text-xl font-bold text-ink">Nytt tilbud</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-muted">Navn</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="F.eks. Blokk 58"
              className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-muted">
              Aldersgruppe (valgfritt)
            </label>
            <input
              value={form.ageRange}
              onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
              placeholder="F.eks. 13-18 år"
              className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-muted">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as LocalActivityCategory })}
              className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
            >
              {LOCAL_ACTIVITY_CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {LOCAL_ACTIVITY_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-muted">
              Lenke til tilbudets egen side
            </label>
            <input
              value={form.externalUrl}
              onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-sans text-xs uppercase tracking-wide text-muted">
              Kort beskrivelse (vises på siden vår)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
            />
          </div>
        </div>
        {error && <p className="mt-3 font-sans text-sm text-accent">{error}</p>}
        <button
          type="button"
          onClick={createActivity}
          disabled={saving}
          className="mt-3 border border-accent bg-accent px-4 py-2 font-sans text-sm uppercase tracking-wide text-paper hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Legger til…" : "Legg til tilbud"}
        </button>
      </div>

      <div>
        <h2 className="font-headline text-xl font-bold text-ink">Alle tilbud</h2>
        {activities.length === 0 && <p className="mt-2 font-serif text-muted">Ingen tilbud lagt inn ennå.</p>}
        <ul className="mt-3 divide-y divide-ink/20">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="font-sans text-xs uppercase tracking-wide text-muted">
                  {LOCAL_ACTIVITY_CATEGORY_LABELS[activity.category]}
                  {activity.ageRange ? ` · ${activity.ageRange}` : ""}
                </p>
                <p className="font-headline text-lg font-bold text-ink">{activity.name}</p>
                <p className="font-serif text-sm text-ink/70">{activity.description}</p>
              </div>
              <button
                disabled={busyId === activity.id}
                onClick={() => remove(activity.id)}
                className="shrink-0 border border-ink/30 px-3 py-1 font-sans text-xs uppercase tracking-wide text-muted hover:border-accent hover:text-accent disabled:opacity-50"
              >
                Fjern
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
