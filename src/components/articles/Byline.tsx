import { ROLE_LABELS } from "@/lib/constants";
import { Role } from "@prisma/client";

type Contributor = { nameSnapshot: string; roleSnapshot: Role };

export function Byline({ contributors }: { contributors: Contributor[] }) {
  if (contributors.length === 0) return null;

  const text = contributors
    .map((c) => `${c.nameSnapshot} (${ROLE_LABELS[c.roleSnapshot]})`)
    .join(", ");

  return <p className="font-sans text-xs uppercase tracking-wide text-muted">Av {text}</p>;
}
