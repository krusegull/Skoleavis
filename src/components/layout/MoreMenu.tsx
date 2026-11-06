"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function MoreMenu({ items }: { items: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="hover:text-accent">
        Mer {open ? "▴" : "▾"}
      </button>
      {open && (
        <ul className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 border border-ink/20 bg-paper py-2 text-left normal-case shadow-lg">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-1.5 font-serif text-base text-ink hover:bg-ink/5 hover:text-accent"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
