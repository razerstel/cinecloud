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
    <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Mi lista</h1>
      {cards.length === 0 ? (
        <p className="mt-2 text-sm text-muted">
          Aún no has guardado nada. Pulsa <span className="font-medium">+ Mi lista</span>{" "}
          en la ficha de cualquier título.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cards.map(({ item, mediaType }) => (
            <Card
              key={`${mediaType}-${item.id}`}
              item={item}
              mediaType={mediaType}
            />
          ))}
        </div>
      )}
    </div>
  );
}
