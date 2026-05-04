import { Hero } from "@/components/Hero";
import { Row } from "@/components/Row";
import { ContinueWatchingRow } from "@/components/ContinueWatchingRow";
import { Suspense } from "react";
import {
  getMoviesByGenre,
  getPopularMovies,
  getPopularTv,
  getTopRatedMovies,
  getTrending,
  getTvByGenre,
} from "@/lib/tmdb";
import { getWatchlistKeys } from "@/lib/user-data";

export const revalidate = 3600;
export const metadata = { title: "Inicio" };

export default async function HomePage() {
  const [
    trending,
    popularMovies,
    topRatedMovies,
    popularTv,
    accion,
    comedia,
    sciFi,
    drama,
    animacion,
    tvDrama,
    watchlistKeys,
  ] = await Promise.all([
    getTrending("week"),
    getPopularMovies(),
    getTopRatedMovies(),
    getPopularTv(),
    getMoviesByGenre(28),
    getMoviesByGenre(35),
    getMoviesByGenre(878),
    getMoviesByGenre(18),
    getMoviesByGenre(16),
    getTvByGenre(18),
    getWatchlistKeys(),
  ]);

  const hero =
    trending.results.find((r) => r.backdrop_path) ?? trending.results[0];

  return (
    <>
      {hero && <Hero item={hero} />}
      <div className="mx-auto max-w-screen-2xl">
        <Suspense>
          <ContinueWatchingRow watchlistKeys={watchlistKeys} />
        </Suspense>
        <Row
          title="Tendencias esta semana"
          items={trending.results}
          priorityFirst
          watchlistKeys={watchlistKeys}
        />
        <Row
          title="Películas populares"
          items={popularMovies.results}
          mediaType="movie"
          watchlistKeys={watchlistKeys}
        />
        <Row
          title="Mejor valoradas"
          items={topRatedMovies.results}
          mediaType="movie"
          watchlistKeys={watchlistKeys}
        />
        <Row
          title="Series populares"
          items={popularTv.results}
          mediaType="tv"
          watchlistKeys={watchlistKeys}
        />
        <Row
          title="Acción"
          items={accion.results}
          mediaType="movie"
          watchlistKeys={watchlistKeys}
        />
        <Row
          title="Comedia"
          items={comedia.results}
          mediaType="movie"
          watchlistKeys={watchlistKeys}
        />
        <Row
          title="Ciencia ficción"
          items={sciFi.results}
          mediaType="movie"
          watchlistKeys={watchlistKeys}
        />
        <Row
          title="Drama"
          items={drama.results}
          mediaType="movie"
          watchlistKeys={watchlistKeys}
        />
        <Row
          title="Animación"
          items={animacion.results}
          mediaType="movie"
          watchlistKeys={watchlistKeys}
        />
        <Row
          title="Series · Drama"
          items={tvDrama.results}
          mediaType="tv"
          watchlistKeys={watchlistKeys}
        />
      </div>
    </>
  );
}
