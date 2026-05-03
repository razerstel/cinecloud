"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function SearchInput() {
  const router = useRouter();
  const search = useSearchParams();
  const [value, setValue] = useState(search.get("q") ?? "");
  const [, startTransition] = useTransition();

  useEffect(() => {
    const id = setTimeout(() => {
      const q = value.trim();
      if (!q) return;
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(q)}`);
      });
    }, 250);
    return () => clearTimeout(id);
  }, [value, router]);

  return (
    <input
      type="search"
      placeholder="Buscar..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const q = value.trim();
          if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
        }
      }}
      className="w-40 rounded-md border border-white/15 bg-black/40 px-3 py-1.5 text-sm placeholder-muted outline-none transition focus:w-56 focus:border-white/40"
    />
  );
}
