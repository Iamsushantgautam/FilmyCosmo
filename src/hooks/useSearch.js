import { useMovieContext } from '../context/MovieContext';

export function useSearch() {
  const { searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen, filteredMovies } = useMovieContext();
  return { searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen, results: filteredMovies };
}
