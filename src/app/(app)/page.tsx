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
  ]);

  const heroPool = trending.results.filter((r) => r.backdrop_path);
  const hero = heroPool[Math.floor(Math.random() * heroPool.length)] ?? trending.results[0];

  return (
    <>
      {hero && <Hero item={hero} />}
      <div className="mx-auto max-w-screen-2xl">
        <Suspense>
          <ContinueWatchingRow />
        </Suspense>
        <Row title="Tendencias esta semana" items={trending.results} priorityFirst />
        <Row title="Películas populares" items={popularMovies.results} mediaType="movie" />
        <Row title="Mejor valoradas" items={topRatedMovies.results} mediaType="movie" />
        <Row title={`Series populares`} items={popularTv.results} mediaType="tv" />
        <Row title={`Acción`} items={accion.results} mediaType="movie" />
        <Row title={`Comedia`} items={comedia.results} mediaType="movie" />
        <Row title={`Ciencia ficción`} items={sciFi.results} mediaType="movie" />
        <Row title={`Drama`} items={drama.results} mediaType="movie" />
        <Row title={`Animación`} items={animacion.results} mediaType="movie" />
        <Row title={`Series · Drama`} items={tvDrama.results} mediaType="tv" />
      </div>
    </>
  );
}
