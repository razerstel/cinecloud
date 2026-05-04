import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Row } from "@/components/Row";
import { WatchlistButton } from "@/components/WatchlistButton";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getTvDetails,
  getTvRecommendations,
  getSeason,
  tmdbImg,
  tmdbTitle,
  tmdbYear,
} from "@/lib/tmdb";
import { getWatchlistKeys } from "@/lib/user-data";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const t = await getTvDetails(Number(id));
    return { title: tmdbTitle(t) };
  } catch {
    return { title: "Serie" };
  }
}

export default async function TvPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const tmdbId = Number(id);
  if (!Number.isFinite(tmdbId)) notFound();

  let details;
  try {
    details = await getTvDetails(tmdbId);
  } catch {
    notFound();
  }

  const seasonsList =
    details.seasons?.filter((s) => s.season_number > 0) ??
    Array.from({ length: details.number_of_seasons ?? 1 }, (_, i) => ({
      season_number: i + 1,
      name: `Temporada ${i + 1}`,
      episode_count: 0,
      poster_path: null,
      id: i + 1,
    }));
  const seasonNumber = Math.max(
    1,
    Math.min(
      Number(sp.season ?? seasonsList[0]?.season_number ?? 1),
      seasonsList.at(-1)?.season_number ?? 1
    )
  );
  const session = await auth();
  const inList = session?.user?.id
    ? !!(await prisma.watchlistItem.findUnique({
        where: {
          userId_mediaType_tmdbId: {
            userId: session.user.id,
            mediaType: "tv",
            tmdbId,
          },
        },
      }))
    : false;
  const season = await getSeason(tmdbId, seasonNumber).catch(() => null);
  const recs = await getTvRecommendations(tmdbId).catch(() => null);
  const watchlistKeys = recs?.results?.length
    ? await getWatchlistKeys()
    : undefined;

  const backdrop = tmdbImg(details.backdrop_path, "original");
  const title = tmdbTitle(details);
  const year = tmdbYear(details);
  const selectedSeason = seasonsList.find(
    (s) => s.season_number === seasonNumber
  );

  return (
    <article>
      <section className="relative isolate -mt-14 min-h-[calc(100svh-3.5rem)] w-full overflow-hidden">
        {backdrop && (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/65 to-background/15" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/70 to-transparent" />

        <div className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-screen-2xl flex-col justify-end px-4 pb-10 pt-32 sm:px-8 lg:pb-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-foreground/85 sm:text-base">
              {year && <span>{year}</span>}
              {details.number_of_seasons ? (
                <span>
                  · {details.number_of_seasons} temporada
                  {details.number_of_seasons === 1 ? "" : "s"}
                </span>
              ) : null}
              {details.vote_average ? (
                <span>· ★ {details.vote_average.toFixed(1)}</span>
              ) : null}
            </div>

            {details.genres?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {details.genres.slice(0, 4).map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-foreground/90 backdrop-blur"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            ) : null}

            {details.tagline && (
              <p className="mt-5 text-base italic text-muted">
                {details.tagline}
              </p>
            )}
            {details.overview && (
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-foreground/90 sm:text-lg">
                {details.overview}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/watch/tv/${tmdbId}?season=${seasonNumber}&episode=1`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-foreground px-7 py-3 text-base font-bold text-background shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-xl hover:shadow-black/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
              >
                ▶ Reproducir
              </Link>
              <WatchlistButton
                mediaType="tv"
                tmdbId={tmdbId}
                initiallyInList={inList}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-4xl font-black tracking-normal text-foreground sm:text-5xl">
            Episodios
          </h2>
          {seasonsList.length > 1 ? (
            <details className="group relative z-20">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-full border border-white/25 bg-background/35 px-5 py-2.5 text-base font-semibold text-foreground shadow-lg shadow-black/20 backdrop-blur-xl transition hover:border-white/45 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 [&::-webkit-details-marker]:hidden">
                <span>
                  {selectedSeason?.name ?? `Temporada ${seasonNumber}`}
                </span>
                <span className="text-sm text-foreground/70 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="absolute left-0 top-[calc(100%+10px)] w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/95 py-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
                {seasonsList.map((s) => (
                  <Link
                    key={s.season_number}
                    href={`/tv/${tmdbId}?season=${s.season_number}`}
                    className={`block px-4 py-3 text-sm font-semibold transition ${
                      s.season_number === seasonNumber
                        ? "bg-white text-background"
                        : "text-foreground/80 hover:bg-white/10 hover:text-foreground"
                    }`}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </details>
          ) : (
            <span className="rounded-full border border-white/20 bg-background/35 px-5 py-2.5 text-base font-semibold text-foreground/85 backdrop-blur-xl">
              {selectedSeason?.name ?? `Temporada ${seasonNumber}`}
            </span>
          )}
        </div>

        {season?.episodes?.length ? (
          <div>
            {season.overview ? (
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-foreground/75">
                {season.overview}
              </p>
            ) : null}
            <ul className="mt-6 space-y-3">
              {season.episodes.map((ep) => (
                <li key={ep.id}>
                  <Link
                    href={`/watch/tv/${tmdbId}?season=${seasonNumber}&episode=${ep.episode_number}`}
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
          </div>
        ) : null}

        {recs?.results?.length ? (
          <Row
            title="Recomendadas"
            items={recs.results.slice(0, 20)}
            mediaType="tv"
            watchlistKeys={watchlistKeys}
          />
        ) : null}
      </div>
    </article>
  );
}
