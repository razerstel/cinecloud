"use client";

import { useEffect, useRef, useState } from "react";

export interface PlayerProps {
  src: string;
  mediaType: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
  durationSec?: number | null;
}

const HEARTBEAT_MS = 30_000;

export function Player({
  src,
  mediaType,
  tmdbId,
  season,
  episode,
  durationSec,
}: PlayerProps) {
  const [marked, setMarked] = useState(false);
  const elapsedRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    let active = !document.hidden;
    if (active) lastTickRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      if (active && lastTickRef.current != null) {
        elapsedRef.current += (now - lastTickRef.current) / 1000;
      }
      lastTickRef.current = active ? now : null;
    };

    const onVisibility = () => {
      tick();
      active = !document.hidden;
      lastTickRef.current = active ? performance.now() : null;
    };

    const flush = async () => {
      tick();
      const elapsed = elapsedRef.current;
      if (elapsed < 5) return;
      const positionPct = durationSec
        ? Math.min(100, (elapsed / durationSec) * 100)
        : Math.min(99, (elapsed / 6000) * 100); // fallback 100min
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            mediaType,
            tmdbId,
            season: season ?? null,
            episode: episode ?? null,
            positionPct,
            durationSec: durationSec ?? null,
          }),
          keepalive: true,
        });
      } catch {
        /* swallow: heartbeat se reintenta en el próximo tick */
      }
    };

    const interval = window.setInterval(flush, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);

    return () => {
      flush();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [mediaType, tmdbId, season, episode, durationSec]);

  const markWatched = async () => {
    setMarked(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mediaType,
        tmdbId,
        season: season ?? null,
        episode: episode ?? null,
        positionPct: 100,
        durationSec: durationSec ?? null,
      }),
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full overflow-hidden rounded-md bg-black shadow-2xl aspect-video">
        <link rel="preconnect" href="https://vidsrc-embed.ru" />
        <iframe
          src={src}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          loading="eager"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/80">
        <button
          type="button"
          onClick={markWatched}
          disabled={marked}
          className="rounded-md border border-white/15 px-3 py-1.5 transition hover:border-white/40 disabled:opacity-60"
        >
          {marked ? "Marcado como visto" : "Marcar como visto"}
        </button>
        <span className="text-xs text-muted">
          El progreso aproximado se guarda automáticamente cada 30 s mientras
          la pestaña está activa.
        </span>
      </div>
    </div>
  );
}
