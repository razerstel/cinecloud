import Image from "next/image";
import Link from "next/link";
import {
  type MediaType,
  type TmdbCard,
  tmdbImg,
  tmdbTitle,
  tmdbYear,
} from "@/lib/tmdb";

export function Hero({ item }: { item: TmdbCard }) {
  const type: MediaType = (item.media_type as MediaType) ?? "movie";
  const backdrop = tmdbImg(item.backdrop_path, "original");
  const title = tmdbTitle(item);
  const year = tmdbYear(item);

  return (
    <section className="relative isolate -mt-14 h-[70svh] min-h-[420px] w-full overflow-hidden">
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
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/60 to-background/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />

      <div className="relative flex h-full max-w-screen-2xl flex-col justify-end px-4 pb-12 sm:px-8 md:max-w-[60%]">
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 line-clamp-3 max-w-xl text-sm text-foreground/85 sm:text-base">
          {item.overview || (year && `Estreno: ${year}`)}
        </p>
        <div className="mt-5 flex gap-3">
          <Link
            href={`/watch/${type}/${item.id}`}
            className="rounded-md bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
          >
            ▶ Reproducir
          </Link>
          <Link
            href={`/${type}/${item.id}`}
            className="rounded-md bg-white/15 px-5 py-2 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-white/25"
          >
            Más info
          </Link>
        </div>
      </div>
    </section>
  );
}
