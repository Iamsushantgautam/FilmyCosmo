import { useMovieContext } from '../context/MovieContext';

export function useCategories() {
  const { categories, genres, selectedCategory, setSelectedCategory, selectedGenre, setSelectedGenre } = useMovieContext();
  return { categories, genres, selectedCategory, setSelectedCategory, selectedGenre, setSelectedGenre };
}
