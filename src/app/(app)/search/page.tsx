import { Card } from "@/components/Card";
import { searchMulti, type TmdbCard } from "@/lib/tmdb";

export const metadata = { title: "Buscar" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  let results: Array<{ item: TmdbCard; mediaType: "movie" | "tv" }> = [];
  if (q.length >= 2) {
    const data = await searchMulti(q).catch(() => null);
    results = (data?.results ?? [])
      .filter(
        (r): r is TmdbCard & { media_type: "movie" | "tv" } =>
          r.media_type === "movie" || r.media_type === "tv"
      )
      .map((r) => ({ item: r, mediaType: r.media_type }));
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">
        {q ? `Resultados para "${q}"` : "Buscar"}
      </h1>
      {q.length > 0 && q.length < 2 ? (
        <p className="mt-2 text-sm text-muted">
          Escribe al menos 2 caracteres.
        </p>
      ) : null}

      {q.length >= 2 && results.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Sin resultados.</p>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {results.map(({ item, mediaType }) => (
            <Card
              key={`${mediaType}-${item.id}`}
              item={item}
              mediaType={mediaType}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
