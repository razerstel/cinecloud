"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Inicio", match: (p: string) => p === "/" },
  {
    href: "/my-list",
    label: "Mi lista",
    match: (p: string) => p === "/my-list" || p.startsWith("/my-list/"),
  },
];

export function NavLinks() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="flex items-center gap-1 text-base font-medium">
      {items.map((it) => {
        const active = it.match(pathname);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={
              active
                ? "rounded-full bg-zinc-700/95 px-5 py-2.5 text-white shadow-md ring-1 ring-white/10"
                : "rounded-full px-5 py-2.5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
            }
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
