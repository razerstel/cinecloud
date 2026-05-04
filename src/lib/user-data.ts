import "server-only";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const watchlistKey = (mediaType: string, tmdbId: number | string) =>
  `${mediaType}:${tmdbId}`;

export async function getWatchlistKeys(): Promise<Set<string>> {
  const session = await auth();
  if (!session?.user?.id) return new Set();
  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    select: { mediaType: true, tmdbId: true },
  });
  return new Set(items.map((it) => watchlistKey(it.mediaType, it.tmdbId)));
}
