"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Submission } from "@prisma/client";
import { SUBMISSION_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export function SubmissionList({ submissions }: { submissions: Submission[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(id: string, status: "NEW" | "READ" | "ARCHIVED") {
    setBusyId(id);
    await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Slette dette bidraget permanent, inkludert opplastede filer?")) return;
    setBusyId(id);
    await fetch(`/api/submissions/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  if (submissions.length === 0) {
    return <p className="font-serif text-muted">Ingen innsendinger ennå.</p>;
  }

  return (
    <ul className="divide-y divide-ink/20">
      {submissions.map((s) => (
        <li key={s.id} className="py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-sans text-xs uppercase tracking-wide text-muted">
                {SUBMISSION_STATUS_LABELS[s.status]} · {formatDate(s.createdAt)}
              </p>
              <p className="mt-1 font-headline text-xl font-bold text-ink">{s.name}</p>
              {s.email && (
                <a href={`mailto:${s.email}`} className="font-sans text-xs text-accent underline underline-offset-2">
                  {s.email}
                </a>
              )}
              {s.message && <p className="mt-1 font-serif text-ink/80">{s.message}</p>}
              <div className="mt-2 flex flex-wrap gap-3 font-sans text-xs">
                <a
                  href={s.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2"
                >
                  Åpne dokument ({s.documentName})
                </a>
                {s.imageUrls.map((url: string, i: number) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">
                    Bilde {i + 1}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 font-sans text-xs uppercase tracking-wide">
              {s.status !== "READ" && (
                <button
                  disabled={busyId === s.id}
                  onClick={() => setStatus(s.id, "READ")}
                  className="border border-ink px-3 py-1 text-ink hover:bg-ink hover:text-paper disabled:opacity-50"
                >
                  Merk som lest
                </button>
              )}
              {s.status !== "ARCHIVED" && (
                <button
                  disabled={busyId === s.id}
                  onClick={() => setStatus(s.id, "ARCHIVED")}
                  className="border border-ink/30 px-3 py-1 text-muted hover:border-ink hover:text-ink disabled:opacity-50"
                >
                  Arkiver
                </button>
              )}
              <button
                disabled={busyId === s.id}
                onClick={() => remove(s.id)}
                className="border border-ink/30 px-3 py-1 text-muted hover:border-accent hover:text-accent disabled:opacity-50"
              >
                Slett
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
