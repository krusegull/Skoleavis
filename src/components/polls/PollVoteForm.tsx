"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Option = { id: string; label: string };

export function PollVoteForm({ pollId, options }: { pollId: string; options: Option[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function vote(optionId: string) {
    setBusyId(optionId);
    setError(null);
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Kunne ikke registrere stemmen din.");
      router.refresh();
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => vote(option.id)}
            disabled={busyId !== null}
            className="border border-ink px-3 py-1.5 font-sans text-sm hover:bg-ink hover:text-paper disabled:opacity-50"
          >
            {busyId === option.id ? "Stemmer…" : option.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 font-sans text-sm text-accent">{error}</p>}
    </div>
  );
}
