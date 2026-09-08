"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function HeaderAuthLink({ loggedIn }: { loggedIn: boolean }) {
  if (!loggedIn) {
    return (
      <Link href="/login" className="hover:text-accent">
        Logg inn
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/dashboard" className="hover:text-accent">
        Dashbord
      </Link>
      <button onClick={() => signOut({ callbackUrl: "/" })} className="hover:text-accent">
        Logg ut
      </button>
    </div>
  );
}
