import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const feideEnabled = Boolean(process.env.FEIDE_CLIENT_ID && process.env.FEIDE_CLIENT_SECRET);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-center font-headline text-4xl text-ink">Logg inn i redaksjonen</h1>
      <p className="mt-2 text-center font-serif text-muted">
        For redaksjonsmedlemmer. Elevkontoer opprettes av en administrator.
      </p>
      <div className="mt-10">
        <Suspense>
          <LoginForm feideEnabled={feideEnabled} />
        </Suspense>
      </div>
    </div>
  );
}
