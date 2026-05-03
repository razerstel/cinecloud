"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { vidsrcEmbedUrl, VIDSRC_BASES } from "@/lib/vidsrc";

export interface PlayerProps {
  mediaType: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
  durationSec?: number | null;
}

const HEARTBEAT_MS = 30_000;
const STORAGE_KEY = "cinecloud:vidsrc-base";

const isKnownBase = (s: string | null): s is (typeof VIDSRC_BASES)[number] =>
  s != null && (VIDSRC_BASES as readonly string[]).includes(s);

const readStoredBase = (): string => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isKnownBase(stored)) return stored;
  } catch {
    /* ignore */
  }
  return VIDSRC_BASES[0];
};

const subscribeStored = (cb: () => void) => {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", handler);
  window.addEventListener("cinecloud:vidsrc-base", cb);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("cinecloud:vidsrc-base", cb);
  };
};

export function Player({
  mediaType,
  tmdbId,
  season,
  episode,
  durationSec,
}: PlayerProps) {
  const [marked, setMarked] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const elapsedRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);

  const base = useSyncExternalStore(
    subscribeStored,
    readStoredBase,
    () => VIDSRC_BASES[0]
  );

  const src = useMemo(() => {
    if (mediaType === "movie") {
      return vidsrcEmbedUrl(
        { type: "movie", idKind: "tmdb", id: tmdbId, autoplay: true },
        base
      );
    }
    return vidsrcEmbedUrl(
      {
        type: "tv",
        idKind: "tmdb",
        id: tmdbId,
        season: season ?? 1,
        episode: episode ?? 1,
        autoplay: true,
        autonext: true,
      },
      base
    );
  }, [base, mediaType, tmdbId, season, episode]);

  const switchBase = (next: string) => {
    setReloadKey((k) => k + 1);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new Event("cinecloud:vidsrc-base"));
    } catch {
      /* ignore */
    }
  };

  const tryNextMirror = () => {
    const idx = VIDSRC_BASES.indexOf(base as (typeof VIDSRC_BASES)[number]);
    const next = VIDSRC_BASES[(idx + 1) % VIDSRC_BASES.length];
    switchBase(next);
  };

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
        : Math.min(99, (elapsed / 6000) * 100);
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
        /* heartbeat se reintenta en el próximo tick */
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
        <iframe
          key={`${base}-${reloadKey}`}
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
        <button
          type="button"
          onClick={tryNextMirror}
          className="rounded-md border border-white/15 px-3 py-1.5 transition hover:border-white/40"
          title="Si la reproducción no carga, prueba otro espejo"
        >
          ↻ Probar otro espejo
        </button>
        <label className="flex items-center gap-2 text-xs text-muted">
          Origen
          <select
            value={base}
            onChange={(e) => switchBase(e.target.value)}
            className="rounded-md border border-white/15 bg-surface-2 px-2 py-1 text-foreground"
          >
            {VIDSRC_BASES.map((b) => (
              <option key={b} value={b}>
                {b.replace("https://", "")}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-muted">
          Si una fuente no carga, salta a otra. La elección se recuerda en este
          navegador.
        </span>
      </div>
    </div>
  );
}
