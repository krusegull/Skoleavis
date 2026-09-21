"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PollWithCounts = {
  id: string;
  question: string;
  isOpen: boolean;
  options: { id: string; label: string; votes: number }[];
};

export function PollAdminPanel({ polls }: { polls: PollWithCounts[] }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createPoll() {
    setError(null);
    const options = optionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!question.trim() || options.length < 2) {
      setError("Skriv et spørsmål og minst to svaralternativer (ett per linje).");
      return;
    }

    setCreating(true);
    const res = await fetch("/api/polls", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: question.trim(), options }),
    });
    setCreating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Kunne ikke opprette avstemningen.");
      return;
    }
    setQuestion("");
    setOptionsText("");
    router.refresh();
  }

  async function toggleOpen(id: string, isOpen: boolean) {
    setBusyId(id);
    await fetch(`/api/polls/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isOpen: !isOpen }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Slette denne avstemningen permanent, inkludert alle stemmer?")) return;
    setBusyId(id);
    await fetch(`/api/polls/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="border border-ink/20 p-5">
        <h2 className="font-headline text-xl font-bold text-ink">Ny avstemning</h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-muted">Spørsmål</label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="F.eks. Hvem vinner Champions League 2026/2027?"
              className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-muted">
              Svaralternativer (ett per linje, minst to)
            </label>
            <textarea
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              rows={6}
              placeholder={"Real Madrid\nBarcelona\nManchester City\n..."}
              className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
            />
          </div>
          {error && <p className="font-sans text-sm text-accent">{error}</p>}
          <button
            type="button"
            onClick={createPoll}
            disabled={creating}
            className="border border-accent bg-accent px-4 py-2 font-sans text-sm uppercase tracking-wide text-paper hover:opacity-90 disabled:opacity-50"
          >
            {creating ? "Oppretter…" : "Opprett avstemning"}
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-headline text-xl font-bold text-ink">Eksisterende avstemninger</h2>
        {polls.length === 0 && <p className="mt-2 font-serif text-muted">Ingen avstemninger ennå.</p>}
        <ul className="mt-3 divide-y divide-ink/20">
          {polls.map((poll) => {
            const total = poll.options.reduce((sum, o) => sum + o.votes, 0);
            return (
              <li key={poll.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-sans text-xs uppercase tracking-wide text-muted">
                      {poll.isOpen ? "Åpen" : "Stengt"} · {total} {total === 1 ? "stemme" : "stemmer"}
                    </p>
                    <p className="mt-1 font-headline text-lg font-bold text-ink">{poll.question}</p>
                    <p className="mt-1 font-serif text-sm text-ink/70">
                      {poll.options.map((o) => `${o.label} (${o.votes})`).join(" · ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2 font-sans text-xs uppercase tracking-wide">
                    <button
                      disabled={busyId === poll.id}
                      onClick={() => toggleOpen(poll.id, poll.isOpen)}
                      className="border border-ink px-3 py-1 hover:bg-ink hover:text-paper disabled:opacity-50"
                    >
                      {poll.isOpen ? "Steng" : "Åpne"}
                    </button>
                    <button
                      disabled={busyId === poll.id}
                      onClick={() => remove(poll.id)}
                      className="border border-ink/30 px-3 py-1 text-muted hover:border-accent hover:text-accent disabled:opacity-50"
                    >
                      Slett
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
