import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getMovieDetails,
  getTvDetails,
  type TmdbCard,
} from "@/lib/tmdb";
import { Row } from "@/components/Row";

export async function ContinueWatchingRow({
  watchlistKeys,
}: {
  watchlistKeys?: Set<string>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const recent = await prisma.watchProgress.findMany({
    where: { userId: session.user.id, positionPct: { lt: 95 } },
    orderBy: { updatedAt: "desc" },
    take: 12,
    distinct: ["mediaType", "tmdbId"],
  });

  if (!recent.length) return null;

  const items: TmdbCard[] = (
    await Promise.all(
      recent.map(async (p) => {
        try {
          const data =
            p.mediaType === "movie"
              ? await getMovieDetails(p.tmdbId)
              : await getTvDetails(p.tmdbId);
          return { ...data, media_type: p.mediaType } as TmdbCard;
        } catch {
          return null;
        }
      })
    )
  ).filter((x): x is TmdbCard => x != null);

  return (
    <Row
      title="Continuar viendo"
      items={items}
      watchlistKeys={watchlistKeys}
    />
  );
}
