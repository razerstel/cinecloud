"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
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
  const [sourceOpen, setSourceOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sourceRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
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
    if (!sourceOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!sourceRef.current?.contains(e.target as Node)) setSourceOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSourceOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [sourceOpen]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

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

  const toggleFullscreen = async () => {
    const node = playerRef.current;
    if (!node) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await node.requestFullscreen();
      }
    } catch {
      /* El navegador puede bloquear fullscreen si no viene de un gesto válido. */
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={playerRef}
        className="group/player relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl shadow-black/60 ring-1 ring-white/10 [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:rounded-none [&:fullscreen]:ring-0"
      >
        <iframe
          key={`${base}-${reloadKey}`}
          src={src}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          loading="eager"
          className="absolute inset-0 h-full w-full border-0"
        />
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute right-4 top-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-sm font-bold text-white shadow-xl shadow-black/30 backdrop-blur-xl opacity-0 transition hover:border-white/30 hover:bg-black/75 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 group-hover/player:opacity-100"
          aria-label={
            isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
          }
          title={
            isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
          }
        >
          <Icon name={isFullscreen ? "minimize" : "maximize"} />
          <span className="hidden sm:inline">
            {isFullscreen ? "Salir" : "Expandir"}
          </span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={markWatched}
            disabled={marked}
            className={`group inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-lg shadow-black/20 transition ${
              marked
                ? "border border-white/10 bg-white/10 text-white/80"
                : "bg-white text-black hover:-translate-y-0.5 hover:bg-zinc-200 active:scale-[0.98]"
            } disabled:cursor-default disabled:translate-y-0`}
          >
            <Icon name={marked ? "checkFilled" : "check"} />
            {marked ? "Visto" : "Marcar como visto"}
          </button>

          <button
            type="button"
            onClick={tryNextMirror}
            className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/20 active:scale-[0.98]"
            title="Si la reproducción no carga, prueba otro espejo"
          >
            <Icon name="refresh" className="transition group-hover:rotate-180" />
            Probar siguiente
          </button>
        </div>

        <div ref={sourceRef} className="relative">
          <button
            type="button"
            onClick={() => setSourceOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={sourceOpen}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/20"
          >
            <Icon name="globe" />
            <span className="text-zinc-300">Fuente</span>
            <span className="font-semibold">{hostOf(base)}</span>
            <Icon
              name="chevron"
              className={`text-zinc-300 transition ${sourceOpen ? "rotate-180" : ""}`}
            />
          </button>

          {sourceOpen && (
            <div
              role="listbox"
              className="absolute right-0 top-[calc(100%+8px)] z-30 w-72 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/60 backdrop-blur-xl"
            >
              <div className="border-b border-white/5 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Servidores
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  Si la reproducción no carga, prueba otro espejo. La selección
                  se recuerda en este navegador.
                </p>
              </div>
              <ul className="max-h-72 overflow-y-auto py-1">
                {VIDSRC_BASES.map((b, i) => {
                  const active = b === base;
                  return (
                    <li key={b}>
                      <button
                        type="button"
                        onClick={() => {
                          switchBase(b);
                          setSourceOpen(false);
                        }}
                        role="option"
                        aria-selected={active}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition ${
                          active
                            ? "bg-white/10 text-white"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/5 text-[11px] font-semibold text-zinc-400">
                            {i + 1}
                          </span>
                          {hostOf(b)}
                        </span>
                        {active && (
                          <Icon name="checkFilled" className="text-accent" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const hostOf = (url: string) => url.replace(/^https?:\/\//, "");

interface IconProps {
  name:
    | "check"
    | "checkFilled"
    | "refresh"
    | "globe"
    | "chevron"
    | "maximize"
    | "minimize";
  className?: string;
}

function Icon({ name, className = "" }: IconProps) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  switch (name) {
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 5 5L20 7" />
        </svg>
      );
    case "checkFilled":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.7 7.3a1 1 0 0 0-1.4-1.4l-5 5-2.3-2.3a1 1 0 1 0-1.4 1.4l3 3a1 1 0 0 0 1.4 0l5.7-5.7Z"
          />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 4v5h-5" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "maximize":
      return (
        <svg {...common}>
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M16 3h3a2 2 0 0 1 2 2v3" />
          <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
          <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
        </svg>
      );
    case "minimize":
      return (
        <svg {...common}>
          <path d="M8 3v3a2 2 0 0 1-2 2H3" />
          <path d="M16 3v3a2 2 0 0 0 2 2h3" />
          <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
          <path d="M3 16h3a2 2 0 0 1 2 2v3" />
        </svg>
      );
  }
}
