"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchInput() {
  const router = useRouter();
  const search = useSearchParams();
  const initialQ = search.get("q") ?? "";
  const [open, setOpen] = useState(initialQ.length > 0);
  const [value, setValue] = useState(initialQ);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        if (!value) setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [value]);

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
    <div ref={wrapRef} className="flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Buscar"
        className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-200 transition hover:bg-white/10 hover:text-white"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-[width,opacity,margin] duration-200 ${
          open ? "ml-2 w-56 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <input
          ref={inputRef}
          type="search"
          placeholder="Buscar películas, series..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const q = value.trim();
              if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
            } else if (e.key === "Escape") {
              setValue("");
              setOpen(false);
            }
          }}
          className="h-9 w-full rounded-md border border-white/20 bg-black/70 px-3 text-sm text-white placeholder-zinc-400 outline-none focus:border-white/50"
        />
      </div>
    </div>
  );
}
