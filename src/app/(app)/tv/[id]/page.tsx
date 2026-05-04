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

  return (
    <article>
      <div className="relative isolate -mt-14 h-[55svh] min-h-[360px] w-full overflow-hidden">
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/20" />
      </div>

      <div className="mx-auto -mt-32 max-w-screen-xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/70">
          {year && <span>{year}</span>}
          {details.number_of_seasons ? (
            <span>
              {details.number_of_seasons} temporada
              {details.number_of_seasons === 1 ? "" : "s"}
            </span>
          ) : null}
          {details.vote_average ? (
            <span>★ {details.vote_average.toFixed(1)}</span>
          ) : null}
          {details.genres?.length ? (
            <span>{details.genres.map((g) => g.name).join(", ")}</span>
          ) : null}
        </div>

        {details.tagline && (
          <p className="mt-3 text-sm italic text-muted">{details.tagline}</p>
        )}
        {details.overview && (
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-foreground/90">
            {details.overview}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/watch/tv/${tmdbId}?season=${seasonNumber}&episode=1`}
            className="rounded-md bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
          >
            ▶ Reproducir
          </Link>
          <WatchlistButton mediaType="tv" tmdbId={tmdbId} initiallyInList={inList} />
        </div>

        {seasonsList.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {seasonsList.map((s) => (
              <Link
                key={s.season_number}
                href={`/tv/${tmdbId}?season=${s.season_number}`}
                className={`rounded-md border px-3 py-1.5 text-sm transition ${
                  s.season_number === seasonNumber
                    ? "border-accent bg-accent text-white"
                    : "border-white/15 hover:border-white/40"
                }`}
              >
                T{s.season_number}
              </Link>
            ))}
          </div>
        )}

        {season?.episodes?.length ? (
          <ul className="mt-6 space-y-3">
            {season.episodes.map((ep) => (
              <li
                key={ep.id}
                className="flex gap-4 rounded-md bg-surface/60 p-3"
              >
                <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded bg-surface-2">
                  {ep.still_path ? (
                    <Image
                      src={tmdbImg(ep.still_path, "w300")!}
                      alt=""
                      fill
                      sizes="9rem"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium">
                      {ep.episode_number}. {ep.name}
                    </h3>
                    <Link
                      href={`/watch/tv/${tmdbId}?season=${seasonNumber}&episode=${ep.episode_number}`}
                      className="rounded-md bg-foreground px-3 py-1 text-xs font-semibold text-background transition hover:bg-foreground/90"
                    >
                      ▶ Ver
                    </Link>
                  </div>
                  {ep.overview && (
                    <p className="mt-1 line-clamp-2 text-sm text-foreground/70">
                      {ep.overview}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
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
