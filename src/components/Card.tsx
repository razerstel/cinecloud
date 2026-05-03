import Image from "next/image";
import Link from "next/link";
import {
  type MediaType,
  type TmdbCard,
  tmdbImg,
  tmdbTitle,
  tmdbYear,
} from "@/lib/tmdb";

export function Card({
  item,
  mediaType,
  priority,
}: {
  item: TmdbCard;
  mediaType?: MediaType;
  priority?: boolean;
}) {
  const type = mediaType ?? item.media_type ?? "movie";
  const poster = tmdbImg(item.poster_path, "w500");
  const href = `/${type}/${item.id}`;
  const title = tmdbTitle(item);
  const year = tmdbYear(item);

  return (
    <Link
      href={href}
      prefetch={false}
      className="group relative block w-40 shrink-0 overflow-hidden rounded-md transition-transform duration-200 hover:z-10 hover:scale-110 hover:shadow-2xl sm:w-44 md:w-48"
    >
      <div className="relative aspect-[2/3] bg-surface-2">
        {poster ? (
          <Image
            src={poster}
            alt={title}
            fill
            sizes="(min-width: 768px) 12rem, 10rem"
            priority={priority}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-xs text-muted">
            {title}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="line-clamp-2 font-semibold leading-tight">{title}</div>
          {year && <div className="ml-2 shrink-0 text-foreground/70">{year}</div>}
        </div>
      </div>
    </Link>
  );
}
