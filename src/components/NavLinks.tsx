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
    <nav className="flex items-center gap-1 text-sm font-medium">
      {items.map((it) => {
        const active = it.match(pathname);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={
              active
                ? "rounded-full bg-zinc-700/90 px-4 py-1.5 text-white shadow-sm"
                : "rounded-full px-4 py-1.5 text-zinc-300 transition hover:text-white"
            }
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
