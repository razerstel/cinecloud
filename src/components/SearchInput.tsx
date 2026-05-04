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
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buscar"
          className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-200 transition hover:bg-white/10 hover:text-white"
        >
          <SearchIcon size={22} />
        </button>
      ) : (
        <div className="group flex h-11 w-72 items-center gap-2 rounded-full border border-white/15 bg-black/60 pl-4 pr-2 backdrop-blur-md transition focus-within:border-white/40 focus-within:bg-black/80 focus-within:shadow-lg focus-within:shadow-black/40 sm:w-80">
          <SearchIcon size={20} className="shrink-0 text-zinc-300" />
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
            className="flex-1 bg-transparent text-base text-white placeholder-zinc-400 outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              aria-label="Limpiar"
              className="grid h-7 w-7 place-items-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
