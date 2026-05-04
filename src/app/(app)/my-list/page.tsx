import { Card } from "@/components/Card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getMovieDetails,
  getTvDetails,
  type TmdbCard,
} from "@/lib/tmdb";

export const metadata = { title: "Mi lista" };
export const dynamic = "force-dynamic";

export default async function MyListPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { addedAt: "desc" },
  });

  type Entry = { item: TmdbCard; mediaType: "movie" | "tv" };
  const fetched = await Promise.all(
    items.map(async (it): Promise<Entry | null> => {
      try {
        const data =
          it.mediaType === "movie"
            ? await getMovieDetails(it.tmdbId)
            : await getTvDetails(it.tmdbId);
        return { item: data, mediaType: it.mediaType as "movie" | "tv" };
      } catch {
        return null;
      }
    })
  );
  const cards: Entry[] = fetched.filter((x): x is Entry => x != null);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-8">
      <h1 className="text-2xl font-bold">Mi lista</h1>
      {cards.length === 0 ? (
        <p className="mt-2 text-sm text-muted">
          Aún no has guardado nada. Pulsa el botón{" "}
          <span className="font-semibold">+</span> sobre cualquier tarjeta.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-10 px-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {cards.map(({ item, mediaType }) => (
            <Card
              key={`${mediaType}-${item.id}`}
              item={item}
              mediaType={mediaType}
              inWatchlist
            />
          ))}
        </div>
      )}
    </div>
  );
}
