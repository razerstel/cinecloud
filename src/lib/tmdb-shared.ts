// Tipos y helpers puros (sin secrets, sin fetch). Importable desde cliente.

export type MediaType = "movie" | "tv";

export interface TmdbImageish {
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TmdbCard extends TmdbImageish {
  id: number;
  media_type?: MediaType;
  title?: string;
  name?: string;
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
  runtime?: number;
  episode_run_time?: number[];
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

export const TMDB_IMG = "https://image.tmdb.org/t/p";

export const tmdbImg = (
  path: string | null,
  size: "w200" | "w300" | "w500" | "w780" | "original" = "w500"
) => (path ? `${TMDB_IMG}/${size}${path}` : null);

export const tmdbTitle = (m: TmdbCard) => m.title ?? m.name ?? "Sin título";

export const tmdbYear = (m: TmdbCard) => {
  const d = m.release_date ?? m.first_air_date ?? "";
  return d ? d.slice(0, 4) : "";
};
