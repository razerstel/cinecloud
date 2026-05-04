"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { tmdbImg, type TmdbEpisode } from "@/lib/tmdb-shared";

interface TvSeasonOption {
  id: number;
  season_number: number;
  name: string;
}

interface TvEpisodesSectionProps {
  tvId: number;
  seasonNumber: number;
  seasons: TvSeasonOption[];
  episodes: TmdbEpisode[];
}

export function TvEpisodesSection({
  tvId,
  seasonNumber,
  seasons,
  episodes,
}: TvEpisodesSectionProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [targetSeason, setTargetSeason] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedSeason =
    seasons.find((s) => s.season_number === seasonNumber) ?? seasons[0];
  const isLoading =
    isPending || (targetSeason !== null && targetSeason !== seasonNumber);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const selectSeason = (nextSeason: number) => {
    setOpen(false);
    if (nextSeason === seasonNumber) return;

    setTargetSeason(nextSeason);
    startTransition(() => {
      router.push(`/tv/${tvId}?season=${nextSeason}`, { scroll: false });
    });
  };

  return (
    <section>
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-4xl font-black tracking-normal text-foreground sm:text-5xl">
          Episodios
        </h2>
        {seasons.length > 1 ? (
          <div ref={menuRef} className="relative z-20">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex min-h-12 items-center gap-3 rounded-full border border-white/25 bg-background/35 px-5 py-2.5 text-base font-semibold text-foreground shadow-lg shadow-black/20 backdrop-blur-xl transition hover:border-white/45 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
              aria-expanded={open}
              aria-haspopup="menu"
            >
              <span>
                {selectedSeason?.name ?? `Temporada ${seasonNumber}`}
              </span>
              <span
                className={`text-sm text-foreground/70 transition ${
                  open ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
            {open ? (
              <div
                role="menu"
                className="absolute left-0 top-[calc(100%+10px)] w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/95 py-2 shadow-2xl shadow-black/50 backdrop-blur-xl"
              >
                {seasons.map((s) => {
                  const isSelected = s.season_number === seasonNumber;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="menuitem"
                      onClick={() => selectSeason(s.season_number)}
                      className={`block w-full px-4 py-3 text-left text-sm font-semibold transition ${
                        isSelected
                          ? "bg-white text-background"
                          : "text-foreground/80 hover:bg-white/10 hover:text-foreground"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : (
          <span className="rounded-full border border-white/20 bg-background/35 px-5 py-2.5 text-base font-semibold text-foreground/85 backdrop-blur-xl">
            {selectedSeason?.name ?? `Temporada ${seasonNumber}`}
          </span>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <EpisodeGhostList />
        ) : episodes.length ? (
          <ul className="space-y-3">
            {episodes.map((ep) => (
              <li key={ep.id}>
                <Link
                  href={`/watch/tv/${tvId}?season=${seasonNumber}&episode=${ep.episode_number}`}
                  className="group relative flex gap-4 overflow-hidden rounded-lg border border-white/10 bg-surface/60 p-3 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-surface/90 hover:shadow-xl hover:shadow-black/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                >
                  <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-md bg-surface-2 sm:h-28 sm:w-52">
                    {ep.still_path ? (
                      <Image
                        src={tmdbImg(ep.still_path, "w300")!}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 13rem, 10rem"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-base font-bold text-black shadow-lg">
                        ▶
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-foreground transition group-hover:text-white">
                        {ep.episode_number}. {ep.name}
                      </h3>
                      {ep.runtime ? (
                        <span className="shrink-0 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-foreground/75">
                          {ep.runtime} min
                        </span>
                      ) : null}
                    </div>
                    {ep.overview && (
                      <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                        {ep.overview}
                      </p>
                    )}
                  </div>
                  <span className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 text-xl text-white/0 transition group-hover:translate-x-1 group-hover:text-white/70 sm:block">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function EpisodeGhostList() {
  return (
    <ul className="space-y-3" aria-label="Cargando episodios">
      {Array.from({ length: 5 }, (_, index) => (
        <li
          key={index}
          className="flex gap-4 overflow-hidden rounded-lg border border-white/10 bg-surface/45 p-3 shadow-lg shadow-black/10"
        >
          <div className="h-24 w-40 shrink-0 animate-pulse rounded-md bg-white/10 sm:h-28 sm:w-52" />
          <div className="min-w-0 flex-1 py-1">
            <div className="h-5 w-2/5 animate-pulse rounded bg-white/15" />
            <div className="mt-4 h-3 w-5/6 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-3 w-3/5 animate-pulse rounded bg-white/10" />
          </div>
        </li>
      ))}
    </ul>
  );
}
