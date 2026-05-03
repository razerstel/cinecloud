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
  const backdrop = tmdbImg(details.backdrop_path, "original");
  const title = tmdbTitle(details);
  const year = tmdbYear(details);
  const runtime = details.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : null;

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
          {runtime && <span>{runtime}</span>}
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

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/watch/movie/${tmdbId}`}
            className="rounded-md bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
          >
            ▶ Reproducir
          </Link>
          <WatchlistButton
            mediaType="movie"
            tmdbId={tmdbId}
            initiallyInList={inList}
          />
        </div>

        {recs?.results?.length ? (
          <Row
            title="Recomendadas"
            items={recs.results.slice(0, 20)}
            mediaType="movie"
          />
        ) : null}
      </div>
    </article>
  );
}
