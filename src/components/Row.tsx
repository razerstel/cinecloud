import { Card } from "@/components/Card";
import type { MediaType, TmdbCard } from "@/lib/tmdb";

export function Row({
  title,
  items,
  mediaType,
  priorityFirst = false,
}: {
  title: string;
  items: TmdbCard[];
  mediaType?: MediaType;
  priorityFirst?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-2 px-4 text-lg font-semibold text-foreground/90 sm:px-6">
        {title}
      </h2>
      <div className="row-scroll flex gap-3 overflow-x-auto px-4 pb-2 sm:px-6">
        {items.map((it, i) => (
          <Card
            key={`${mediaType ?? it.media_type ?? "x"}-${it.id}`}
            item={it}
            mediaType={mediaType}
            priority={priorityFirst && i < 4}
          />
        ))}
      </div>
    </section>
  );
}
