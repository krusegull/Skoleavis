"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm({ feideEnabled }: { feideEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Feil e-post eller passord.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4 border border-ink/20 bg-white/60 p-6">
        <div>
          <label htmlFor="email" className="block font-sans text-xs uppercase tracking-wide text-muted">
            E-post
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-ink/30 bg-paper px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="block font-sans text-xs uppercase tracking-wide text-muted">
            Passord
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-ink/30 bg-paper px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
          />
        </div>

        {error && <p className="font-sans text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink py-2 font-sans text-sm uppercase tracking-wide text-paper transition hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Logger inn…" : "Logg inn"}
        </button>
      </form>

      {feideEnabled && (
        <div className="mt-4">
          <button
            onClick={() => signIn("feide", { callbackUrl })}
            className="w-full border border-ink py-2 font-sans text-sm uppercase tracking-wide text-ink transition hover:bg-ink hover:text-paper"
          >
            Logg inn med Feide
          </button>
        </div>
      )}
    </div>
  );
}
