import "server-only";
import type {
  TmdbCard,
  TmdbDetails,
  TmdbPaged,
  TmdbSeasonDetails,
} from "@/lib/tmdb-shared";

export * from "@/lib/tmdb-shared";

const BASE = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const KEY = process.env.TMDB_API_KEY ?? "";
const isV4 = KEY.split(".").length === 3;

if (!KEY && process.env.NODE_ENV !== "test") {
  console.warn("[tmdb] TMDB_API_KEY no está definido en .env");
}

interface FetchOptions {
  params?: Record<string, string | number | undefined>;
  revalidate?: number;
}

async function tmdbFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("language", "es-ES");
  if (!isV4 && KEY) url.searchParams.set("api_key", KEY);
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const headers: HeadersInit = { accept: "application/json" };
  if (isV4) headers.authorization = `Bearer ${KEY}`;

  const res = await fetch(url, {
    headers,
    next: { revalidate: opts.revalidate ?? 3600 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`TMDB ${res.status} ${path}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export const getTrending = (window: "day" | "week" = "week") =>
  tmdbFetch<TmdbPaged<TmdbCard>>(`/trending/all/${window}`);

export const getPopularMovies = () =>
  tmdbFetch<TmdbPaged<TmdbCard>>("/movie/popular");

export const getTopRatedMovies = () =>
  tmdbFetch<TmdbPaged<TmdbCard>>("/movie/top_rated");

export const getPopularTv = () =>
  tmdbFetch<TmdbPaged<TmdbCard>>("/tv/popular");

export const getMoviesByGenre = (genreId: number) =>
  tmdbFetch<TmdbPaged<TmdbCard>>("/discover/movie", {
    params: { with_genres: genreId, sort_by: "popularity.desc" },
  });

export const getTvByGenre = (genreId: number) =>
  tmdbFetch<TmdbPaged<TmdbCard>>("/discover/tv", {
    params: { with_genres: genreId, sort_by: "popularity.desc" },
  });

export const getMovieDetails = (id: number) =>
  tmdbFetch<TmdbDetails>(`/movie/${id}`, {
    params: { append_to_response: "external_ids" },
  });

export const getTvDetails = (id: number) =>
  tmdbFetch<TmdbDetails>(`/tv/${id}`, {
    params: { append_to_response: "external_ids" },
  });

export const getSeason = (tvId: number, seasonNumber: number) =>
  tmdbFetch<TmdbSeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);

export const getMovieRecommendations = (id: number) =>
  tmdbFetch<TmdbPaged<TmdbCard>>(`/movie/${id}/recommendations`);

export const getTvRecommendations = (id: number) =>
  tmdbFetch<TmdbPaged<TmdbCard>>(`/tv/${id}/recommendations`);

export const searchMulti = (query: string) =>
  tmdbFetch<TmdbPaged<TmdbCard>>("/search/multi", {
    params: { query, include_adult: "false" },
    revalidate: 60 * 10,
  });

// Géneros TMDB usados en filas del Home
export const GENRES = {
  movie: [
    { id: 28, name: "Acción" },
    { id: 35, name: "Comedia" },
    { id: 18, name: "Drama" },
    { id: 878, name: "Ciencia ficción" },
    { id: 27, name: "Terror" },
    { id: 10749, name: "Romance" },
    { id: 16, name: "Animación" },
  ],
  tv: [
    { id: 18, name: "Drama" },
    { id: 35, name: "Comedia" },
    { id: 10759, name: "Acción y aventura" },
    { id: 10765, name: "Ciencia ficción y fantasía" },
    { id: 16, name: "Animación" },
    { id: 80, name: "Crimen" },
  ],
} as const;
