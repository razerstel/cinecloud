import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Player } from "@/components/Player";
import { EpisodeRow } from "@/components/EpisodeRow";
import {
  getMovieDetails,
  getSeason,
  getTvDetails,
  type MediaType,
  tmdbImg,
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
  const currentEpisode =
    mediaType === "tv"
      ? seasonData?.episodes.find((ep) => ep.episode_number === episode)
      : null;
  const nextEpisode =
    mediaType === "tv" && episode
      ? seasonData?.episodes.find((ep) => ep.episode_number > episode)
      : null;
  const nextSeasonNumber =
    mediaType === "tv" && !nextEpisode
      ? details.seasons
          ?.filter((s) => s.season_number > (season ?? 1))
          .sort((a, b) => a.season_number - b.season_number)[0]
          ?.season_number
      : undefined;
  const nextEpisodeHref = nextEpisode
    ? `/watch/tv/${tmdbId}?season=${season}&episode=${nextEpisode.episode_number}`
    : nextSeasonNumber
      ? `/watch/tv/${tmdbId}?season=${nextSeasonNumber}&episode=1`
      : null;
  const backdrop = tmdbImg(details.backdrop_path, "original");

  return (
    <main className="relative isolate -mt-14 min-h-screen overflow-hidden px-3 pb-12 pt-20 sm:px-6 lg:pt-24">
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover opacity-35"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background to-background" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/70 to-background/40" />

      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/${mediaType}/${tmdbId}`}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-foreground/80 backdrop-blur-xl transition hover:border-white/25 hover:bg-white/15 hover:text-foreground"
            >
              ← Volver a la ficha
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground/70">
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                Reproduciendo
              </span>
              {mediaType === "tv" && season && episode ? (
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                  T{season} · E{episode}
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 max-w-5xl text-3xl font-black leading-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            {currentEpisode ? (
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground/75">
                {currentEpisode.episode_number}. {currentEpisode.name}
              </p>
            ) : null}
          </div>

          {nextEpisodeHref ? (
            <Link
              href={nextEpisodeHref}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-lg bg-foreground px-6 py-3 text-base font-bold text-background shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-xl hover:shadow-black/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
            >
              Siguiente episodio
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-3">
          <Player
            mediaType={mediaType}
            tmdbId={tmdbId}
            season={season}
            episode={episode}
            durationSec={durationSec}
          />
        </div>

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
    </main>
  );
}
