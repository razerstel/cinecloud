import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Row } from "@/components/Row";
import { WatchlistButton } from "@/components/WatchlistButton";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getMovieDetails,
  getMovieRecommendations,
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
    const m = await getMovieDetails(Number(id));
    return { title: tmdbTitle(m) };
  } catch {
    return { title: "Película" };
  }
}

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tmdbId = Number(id);
  if (!Number.isFinite(tmdbId)) notFound();

  let details;
  try {
    details = await getMovieDetails(tmdbId);
  } catch {
    notFound();
  }

  const session = await auth();
  const inList = session?.user?.id
    ? !!(await prisma.watchlistItem.findUnique({
        where: {
          userId_mediaType_tmdbId: {
            userId: session.user.id,
            mediaType: "movie",
            tmdbId,
          },
        },
      }))
    : false;
  const recs = await getMovieRecommendations(tmdbId).catch(() => null);
  const watchlistKeys = recs?.results?.length
    ? await getWatchlistKeys()
    : undefined;
  const backdrop = tmdbImg(details.backdrop_path, "original");
  const title = tmdbTitle(details);
  const year = tmdbYear(details);
  const runtime = details.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : null;

  return (
    <article>
      <section className="relative isolate -mt-14 w-full overflow-hidden">
        <div className="relative h-[60svh] min-h-[420px] w-full">
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
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/80 to-background/30" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/70 via-background/20 to-transparent" />

          <div className="mx-auto flex h-full max-w-screen-2xl flex-col justify-end px-4 pb-10 sm:px-8 md:max-w-[80%]">
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
              {title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/80">
              {year && <span>{year}</span>}
              {runtime && <span>· {runtime}</span>}
              {details.vote_average ? (
                <span>· ★ {details.vote_average.toFixed(1)}</span>
              ) : null}
              {details.genres?.length ? (
                <span className="hidden sm:inline">
                  · {details.genres.map((g) => g.name).join(", ")}
                </span>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/watch/movie/${tmdbId}`}
                className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition hover:bg-foreground/90"
              >
                ▶ Reproducir
              </Link>
              <WatchlistButton
                mediaType="movie"
                tmdbId={tmdbId}
                initiallyInList={inList}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            {details.tagline && (
              <p className="text-base italic text-muted">{details.tagline}</p>
            )}
            {details.overview && (
              <p className="mt-3 text-base leading-relaxed text-foreground/90 sm:text-lg">
                {details.overview}
              </p>
            )}
          </div>
          <aside className="space-y-3 text-sm">
            {details.genres?.length ? (
              <div>
                <span className="text-muted">Géneros: </span>
                <span className="text-foreground/90">
                  {details.genres.map((g) => g.name).join(", ")}
                </span>
              </div>
            ) : null}
            {details.status && (
              <div>
                <span className="text-muted">Estado: </span>
                <span className="text-foreground/90">{details.status}</span>
              </div>
            )}
            {year && (
              <div>
                <span className="text-muted">Año: </span>
                <span className="text-foreground/90">{year}</span>
              </div>
            )}
          </aside>
        </div>

        {recs?.results?.length ? (
          <Row
            title="Recomendadas"
            items={recs.results.slice(0, 20)}
            mediaType="movie"
            watchlistKeys={watchlistKeys}
          />
        ) : null}
      </div>
    </article>
  );
}
