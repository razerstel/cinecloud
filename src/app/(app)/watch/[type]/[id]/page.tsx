import Link from "next/link";
import { notFound } from "next/navigation";
import { Player } from "@/components/Player";
import { EpisodeRow } from "@/components/EpisodeRow";
import {
  getMovieDetails,
  getSeason,
  getTvDetails,
  type MediaType,
  tmdbTitle,
} from "@/lib/tmdb";

export const dynamic = "force-dynamic"; // depende de searchParams (season/episode)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (type !== "movie" && type !== "tv") return {};
  try {
    const data =
      type === "movie"
        ? await getMovieDetails(Number(id))
        : await getTvDetails(Number(id));
    return { title: `Reproduciendo · ${tmdbTitle(data)}` };
  } catch {
    return { title: "Reproductor" };
  }
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}) {
  const { type, id } = await params;
  if (type !== "movie" && type !== "tv") notFound();

  const tmdbId = Number(id);
  if (!Number.isFinite(tmdbId)) notFound();

  const sp = await searchParams;
  const mediaType = type as MediaType;

  const details =
    mediaType === "movie"
      ? await getMovieDetails(tmdbId).catch(() => null)
      : await getTvDetails(tmdbId).catch(() => null);
  if (!details) notFound();

  const season = sp.season ? Math.max(1, Number(sp.season)) : undefined;
  const episode = sp.episode ? Math.max(1, Number(sp.episode)) : undefined;

  const title = tmdbTitle(details);
  const durationSec =
    mediaType === "movie" && details.runtime
      ? details.runtime * 60
      : mediaType === "tv" && details.episode_run_time?.[0]
        ? details.episode_run_time[0] * 60
        : null;

  const seasonData =
    mediaType === "tv"
      ? await getSeason(tmdbId, season ?? 1).catch(() => null)
      : null;

  return (
    <div className="mx-auto max-w-screen-xl px-3 pt-4 sm:px-6">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h1 className="truncate text-xl font-semibold sm:text-2xl">
          {title}
          {mediaType === "tv" && season && episode && (
            <span className="ml-2 text-base text-muted">
              T{season} · E{episode}
            </span>
          )}
        </h1>
        <Link
          href={`/${mediaType}/${tmdbId}`}
          className="shrink-0 text-sm text-foreground/70 hover:text-foreground"
        >
          ← Volver a la ficha
        </Link>
      </div>

      <Player
        mediaType={mediaType}
        tmdbId={tmdbId}
        season={season}
        episode={episode}
        durationSec={durationSec}
      />

      {mediaType === "tv" && seasonData?.episodes?.length ? (
        <EpisodeRow
          tvId={tmdbId}
          season={seasonData.season_number}
          episodes={seasonData.episodes}
          currentEpisode={episode}
          seriesName={title}
        />
      ) : null}
    </div>
  );
}
