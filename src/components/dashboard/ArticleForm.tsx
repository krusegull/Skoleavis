"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Article, ArticleContributor, Category, Role } from "@prisma/client";
import { CATEGORY_LABELS, CATEGORY_ORDER, ROLE_LABELS, ROLE_ORDER } from "@/lib/constants";
import { ImageUploadField } from "./ImageUploadField";

type RosterEntry = { id: string; name: string; role: Role };
type ContributorDraft = { userId: string; name: string; role: Role };

type ArticleWithContributors = Article & { contributors: ArticleContributor[] };

export function ArticleForm({
  initialArticle,
  roster,
  currentUser,
}: {
  initialArticle: ArticleWithContributors | null;
  roster: RosterEntry[];
  currentUser: { id: string; name: string; role: Role };
}) {
  const router = useRouter();
  const isNew = !initialArticle;

  const [title, setTitle] = useState(initialArticle?.title ?? "");
  const [ingress, setIngress] = useState(initialArticle?.ingress ?? "");
  const [teaser, setTeaser] = useState(initialArticle?.teaser ?? "");
  const [body, setBody] = useState(initialArticle?.body ?? "");
  const [imageUrl, setImageUrl] = useState(initialArticle?.imageUrl ?? "");
  const [category, setCategory] = useState<Category>(initialArticle?.category ?? Category.NEWS);
  const [contributors, setContributors] = useState<ContributorDraft[]>(
    initialArticle?.contributors.map((c) => ({ userId: c.userId ?? "", name: c.nameSnapshot, role: c.roleSnapshot })) ?? [
      { userId: currentUser.id, name: currentUser.name, role: currentUser.role },
    ]
  );
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState<Role>(Role.JOURNALIST);

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [teaserLoading, setTeaserLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addContributor() {
    const person = roster.find((r) => r.id === addUserId);
    if (!person) return;
    if (contributors.some((c) => c.userId === person.id && c.role === addRole)) return;
    setContributors([...contributors, { userId: person.id, name: person.name, role: addRole }]);
    setAddUserId("");
  }

  function removeContributor(index: number) {
    setContributors(contributors.filter((_, i) => i !== index));
  }

  async function save(): Promise<string | null> {
    setError(null);
    const payload = {
      title,
      ingress,
      teaser: teaser || null,
      body,
      imageUrl: imageUrl || null,
      category,
    };

    if (isNew) {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError("Kunne ikke lagre saken. Sjekk at alle påkrevde felt er fylt ut.");
        return null;
      }
      const { article } = await res.json();
      await fetch(`/api/articles/${article.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contributors }),
      });
      return article.id as string;
    }

    const res = await fetch(`/api/articles/${initialArticle!.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, contributors }),
    });
    if (!res.ok) {
      setError("Kunne ikke lagre saken.");
      return null;
    }
    return initialArticle!.id;
  }

  async function handleSave() {
    setSaving(true);
    const id = await save();
    setSaving(false);
    if (id) {
      router.push(`/dashboard/saker/${id}/rediger`);
      router.refresh();
    }
  }

  async function handleSubmitForReview() {
    setSubmitting(true);
    const id = await save();
    if (id) {
      await fetch(`/api/articles/${id}/submit`, { method: "POST" });
      router.push("/dashboard");
      router.refresh();
    }
    setSubmitting(false);
  }

  async function suggestTeaser() {
    if (!title || !ingress || !body) {
      setError("Fyll ut tittel, ingress og brødtekst før du ber om et teaser-forslag.");
      return;
    }
    setTeaserLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teaser", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, ingress, body, previousTeaser: teaser || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke hente teaser-forslag.");
        return;
      }
      setTeaser(data.teaser);
    } finally {
      setTeaserLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">Tittel</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-headline text-2xl text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">Kategori</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="mt-1 w-full max-w-xs border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
        >
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <ImageUploadField value={imageUrl} onChange={setImageUrl} label="Bilde (valgfritt)" />

      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">Ingress</label>
        <textarea
          value={ingress}
          onChange={(e) => setIngress(e.target.value)}
          rows={2}
          className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-lg italic text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block font-sans text-xs uppercase tracking-wide text-muted">
            Teaser (valgfri, brukes i grid/lenker)
          </label>
          <button
            type="button"
            onClick={suggestTeaser}
            disabled={teaserLoading}
            className="font-sans text-xs uppercase tracking-wide text-accent hover:underline disabled:opacity-50"
          >
            {teaserLoading ? "Foreslår…" : "Foreslå teaser"}
          </button>
        </div>
        <textarea
          value={teaser ?? ""}
          onChange={(e) => setTeaser(e.target.value)}
          rows={2}
          className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">Brødtekst</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={14}
          className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
        />
        <p className="mt-1 font-sans text-xs text-muted">Tomme linjer skiller avsnitt.</p>
      </div>

      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">Bidragsytere (byline)</label>
        <ul className="mt-2 space-y-1">
          {contributors.map((c, i) => (
            <li key={`${c.userId}-${c.role}-${i}`} className="flex items-center justify-between border border-ink/20 bg-white px-3 py-1.5">
              <span className="font-serif text-ink">
                {c.name} <span className="text-muted">— {ROLE_LABELS[c.role]}</span>
              </span>
              <button type="button" onClick={() => removeContributor(i)} className="font-sans text-xs text-muted hover:text-accent">
                Fjern
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <div>
            <label className="block font-sans text-xs text-muted">Person</label>
            <select
              value={addUserId}
              onChange={(e) => setAddUserId(e.target.value)}
              className="border border-ink/30 bg-white px-2 py-1 font-serif text-sm"
            >
              <option value="">Velg…</option>
              {roster.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-sans text-xs text-muted">Rolle på denne saken</label>
            <select
              value={addRole}
              onChange={(e) => setAddRole(e.target.value as Role)}
              className="border border-ink/30 bg-white px-2 py-1 font-serif text-sm"
            >
              {ROLE_ORDER.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={addContributor}
            disabled={!addUserId}
            className="border border-ink px-3 py-1.5 font-sans text-xs uppercase tracking-wide hover:bg-ink hover:text-paper disabled:opacity-50"
          >
            Legg til
          </button>
        </div>
      </div>

      {error && <p className="font-sans text-sm text-accent">{error}</p>}

      <div className="flex flex-wrap gap-3 border-t border-ink/20 pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || submitting}
          className="border border-ink px-4 py-2 font-sans text-sm uppercase tracking-wide hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {saving ? "Lagrer…" : "Lagre kladd"}
        </button>
        <button
          type="button"
          onClick={handleSubmitForReview}
          disabled={saving || submitting}
          className="border border-accent bg-accent px-4 py-2 font-sans text-sm uppercase tracking-wide text-paper hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Sender…" : "Lagre og send til godkjenning"}
        </button>
      </div>
    </div>
  );
}
