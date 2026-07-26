import { useMovieContext } from '../context/MovieContext';

export function useMovies() {
  const { movies, filteredMovies, loading, error, trendingMovies, recentlyAddedMovies, heroMovie, refreshMovies } = useMovieContext();
  return { movies, filteredMovies, loading, error, trendingMovies, recentlyAddedMovies, heroMovie, refreshMovies };
}
