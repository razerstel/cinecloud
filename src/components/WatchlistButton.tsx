"use client";

import { useState, useTransition } from "react";

export function WatchlistButton({
  mediaType,
  tmdbId,
  initiallyInList,
}: {
  mediaType: "movie" | "tv";
  tmdbId: number;
  initiallyInList: boolean;
}) {
  const [inList, setInList] = useState(initiallyInList);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !inList;
    setInList(next);
    startTransition(async () => {
      const res = await fetch("/api/watchlist", {
        method: next ? "POST" : "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mediaType, tmdbId }),
      });
      if (!res.ok) setInList(!next);
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/15 px-6 py-3 text-base font-bold text-foreground shadow-lg shadow-black/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/25 hover:shadow-xl hover:shadow-black/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 disabled:translate-y-0 disabled:opacity-60"
    >
      {inList ? "✓ En mi lista" : "+ Mi lista"}
    </button>
  );
}
