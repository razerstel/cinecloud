"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  tmdbImg,
  tmdbTitle,
  tmdbYear,
  type MediaType,
  type TmdbCard,
} from "@/lib/tmdb-shared";

interface CardProps {
  item: TmdbCard;
  mediaType?: MediaType;
  priority?: boolean;
  inWatchlist?: boolean;
}

export function Card({
  item,
  mediaType,
  priority,
  inWatchlist = false,
}: CardProps) {
  const type: MediaType =
    (mediaType ?? (item.media_type as MediaType | undefined) ?? "movie");
  const backdrop =
    tmdbImg(item.backdrop_path, "w780") ?? tmdbImg(item.poster_path, "w500");
  const href = `/${type}/${item.id}`;
  const title = tmdbTitle(item);
  const year = tmdbYear(item);

  const [inList, setInList] = useState(inWatchlist);
  const [, startTransition] = useTransition();

  const toggleList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !inList;
    setInList(next);
    startTransition(async () => {
      try {
        const res = await fetch("/api/watchlist", {
          method: next ? "POST" : "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mediaType: type, tmdbId: item.id }),
        });
        if (!res.ok) setInList(!next);
      } catch {
        setInList(!next);
      }
    });
  };

  return (
    <Link
      href={href}
      prefetch={false}
      className="group relative block transition-transform duration-300 ease-out will-change-transform hover:z-30 hover:scale-[1.22]"
      style={{ transformOrigin: "center" }}
    >
      <div className="relative aspect-video overflow-hidden rounded-md bg-surface-2 shadow-md transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-black/70 group-hover:ring-1 group-hover:ring-white/20">
        {backdrop ? (
          <Image
            src={backdrop}
            alt={title}
            fill
            sizes="(min-width: 1280px) 18rem, (min-width: 640px) 16rem, 14rem"
            priority={priority}
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-xs text-muted">
            {title}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-2.5 transition duration-300 group-hover:opacity-0">
          <div className="line-clamp-1 text-xs font-semibold leading-tight sm:text-sm">
            {title}
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/55 to-black/15 p-3 opacity-0 transition duration-300 group-hover:opacity-100">
          <div className="flex items-center justify-between gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-black shadow-md transition group-hover:scale-105">
              <PlayIcon />
            </span>
            <button
              type="button"
              onClick={toggleList}
              aria-label={inList ? "Quitar de mi lista" : "Añadir a mi lista"}
              aria-pressed={inList}
              className={`grid h-9 w-9 place-items-center rounded-full border-2 backdrop-blur transition ${
                inList
                  ? "border-white bg-white/15 text-white"
                  : "border-white/60 bg-black/40 text-white hover:border-white"
              }`}
            >
              {inList ? <CheckIcon /> : <PlusIcon />}
            </button>
          </div>

          <div className="mt-2 line-clamp-1 text-sm font-bold">{title}</div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-foreground/80">
            {year && <span>{year}</span>}
            {item.vote_average ? (
              <span>★ {item.vote_average.toFixed(1)}</span>
            ) : null}
            <span className="ml-auto rounded border border-white/30 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
              {type === "tv" ? "Serie" : "Peli"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}
