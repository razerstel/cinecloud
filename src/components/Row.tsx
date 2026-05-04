import { Card } from "@/components/Card";
import { watchlistKey } from "@/lib/user-data";
import type { MediaType, TmdbCard } from "@/lib/tmdb-shared";

export function Row({
  title,
  items,
  mediaType,
  priorityFirst = false,
  watchlistKeys,
}: {
  title: string;
  items: TmdbCard[];
  mediaType?: MediaType;
  priorityFirst?: boolean;
  watchlistKeys?: Set<string>;
}) {
  if (!items.length) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-3 px-4 text-lg font-semibold text-foreground/90 sm:px-8">
        {title}
      </h2>
      <div className="row-scroll flex gap-3 overflow-x-auto px-4 py-8 sm:px-8">
        {items.map((it, i) => {
          const type =
            mediaType ?? (it.media_type as MediaType | undefined) ?? "movie";
          const inList =
            watchlistKeys?.has(watchlistKey(type, it.id)) ?? false;
          return (
            <div
              key={`${type}-${it.id}`}
              className="w-56 shrink-0 sm:w-64 md:w-72"
            >
              <Card
                item={it}
                mediaType={mediaType}
                priority={priorityFirst && i < 3}
                inWatchlist={inList}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
