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
      className="rounded-md bg-white/15 px-5 py-2 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-white/25 disabled:opacity-60"
    >
      {inList ? "✓ En mi lista" : "+ Mi lista"}
    </button>
  );
}
