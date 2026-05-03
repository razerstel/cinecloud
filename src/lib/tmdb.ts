import "server-only";

const BASE = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const KEY = process.env.TMDB_API_KEY ?? "";
const isV4 = KEY.split(".").length === 3; // JWT-shaped → v4 read token

export const TMDB_IMG = process.env.TMDB_IMG_BASE_URL ?? "https://image.tmdb.org/t/p";

if (!KEY && process.env.NODE_ENV !== "test") {
  console.warn("[tmdb] TMDB_API_KEY no está definido en .env");
}

export type MediaType = "movie" | "tv";

export interface TmdbImageish {
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TmdbCard extends TmdbImageish {
  id: number;
  media_type?: MediaType;
  title?: string; // movies
  name?: string; // tv
  release_date?: string;
  first_air_date?: string;
  overview: string;
  vote_average?: number;
}

export interface TmdbPaged<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbDetails extends TmdbCard {
  genres: TmdbGenre[];
  runtime?: number; // movies
  episode_run_time?: number[]; // tv
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Array<{
    id: number;
    season_number: number;
    name: string;
    episode_count: number;
    poster_path: string | null;
  }>;
  tagline?: string;
  status?: string;
  external_ids?: { imdb_id: string | null };
}

export interface TmdbEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
  vote_average?: number;
}

export interface TmdbSeasonDetails {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  episodes: TmdbEpisode[];
}

interface FetchOptions {
  params?: Record<string, string | number | undefined>;
  revalidate?: number; // segundos; false → no cache; default 1h
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

export const tmdbImg = (
  path: string | null,
  size: "w200" | "w300" | "w500" | "w780" | "original" = "w500"
) => (path ? `${TMDB_IMG}/${size}${path}` : null);

export const tmdbTitle = (m: TmdbCard) => m.title ?? m.name ?? "Sin título";
export const tmdbYear = (m: TmdbCard) => {
  const d = m.release_date ?? m.first_air_date ?? "";
  return d ? d.slice(0, 4) : "";
};

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

// Géneros TMDB que usaremos para las filas del Home
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
