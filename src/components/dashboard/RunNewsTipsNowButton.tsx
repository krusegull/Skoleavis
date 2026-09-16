"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RunNewsTipsNowButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runNow() {
    setRunning(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/news-tips/run-now", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke søke etter nyhetstips akkurat nå.");
        return;
      }
      if (data.saved > 0) {
        setMessage(`Fant ${data.found} sak(er), ${data.saved} nye tips lagt til under.`);
      } else if (data.found === 0) {
        setError(
          "Søket fant ingen saker i det hele tatt - det tyder på at noe er feil med " +
            "oppsettet (f.eks. at ANTHROPIC_API_KEY mangler i Vercel), ikke at det ikke " +
            "har skjedd noe denne uken. Sjekk funksjonsloggene i Vercel for detaljer."
        );
      } else {
        setMessage(`Søket er ferdig, men fant ingen nye tips (${data.found} sak(er) var allerede kjent).`);
      }
      router.refresh();
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={runNow}
        disabled={running}
        className="border border-ink px-3 py-1.5 font-sans text-xs uppercase tracking-wide hover:bg-ink hover:text-paper disabled:opacity-50"
        title="Søker etter nyhetstips nå, i stedet for å vente til torsdag"
      >
        {running ? "Søker etter nyheter… (kan ta et halvt minutt)" : "Kjør søket nå"}
      </button>
      {message && <p className="font-sans text-sm text-ink/70">{message}</p>}
      {error && <p className="font-sans text-sm text-accent">{error}</p>}
    </div>
  );
}
