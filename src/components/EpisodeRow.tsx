"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { tmdbImg, type TmdbEpisode } from "@/lib/tmdb-shared";

interface EpisodeRowProps {
  tvId: number;
  season: number;
  episodes: TmdbEpisode[];
  currentEpisode?: number;
  seriesName?: string;
}

export function EpisodeRow({
  tvId,
  season,
  episodes,
  currentEpisode,
  seriesName,
}: EpisodeRowProps) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentEpisode, season]);

  if (!episodes.length) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-foreground/90">
          Episodios · Temporada {season}
        </h2>
        {seriesName && (
          <Link
            href={`/tv/${tvId}?season=${season}`}
            className="text-sm text-zinc-300 transition hover:text-white"
          >
            Ver todos →
          </Link>
        )}
      </div>

      <div className="row-scroll flex gap-3 overflow-x-auto pb-3">
        {episodes.map((ep) => {
          const isActive = ep.episode_number === currentEpisode;
          const still = tmdbImg(ep.still_path, "w300");
          const href = `/watch/tv/${tvId}?season=${season}&episode=${ep.episode_number}`;
          return (
            <Link
              key={ep.id}
              ref={isActive ? activeRef : null}
              href={href}
              prefetch={false}
              className={`group relative flex w-64 shrink-0 flex-col overflow-hidden rounded-md bg-surface/70 transition ${
                isActive
                  ? "ring-2 ring-accent shadow-lg shadow-accent/25"
                  : "hover:bg-surface"
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              <div className="relative aspect-video bg-surface-2">
                {still ? (
                  <Image
                    src={still}
                    alt=""
                    fill
                    sizes="16rem"
                    className="object-cover"
                  />
                ) : null}
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="rounded-full bg-accent/90 px-3 py-1 text-xs font-semibold text-white">
                      Reproduciendo
                    </span>
                  </div>
                )}
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">
                      ▶ Reproducir
                    </span>
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs font-semibold">
                  E{ep.episode_number}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-3">
                <h3 className="line-clamp-1 text-sm font-semibold">
                  {ep.episode_number}. {ep.name}
                </h3>
                {ep.overview && (
                  <p className="mt-1 line-clamp-2 text-xs text-foreground/70">
                    {ep.overview}
                  </p>
                )}
                {ep.runtime ? (
                  <span className="mt-2 text-xs text-muted">
                    {ep.runtime} min
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
