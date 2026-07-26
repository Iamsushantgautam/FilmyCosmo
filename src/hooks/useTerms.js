import { useMovieContext } from '../context/MovieContext';

export function useTerms() {
  const { terms, selectedTerm, setSelectedTerm } = useMovieContext();
  return { terms, selectedTerm, setSelectedTerm };
}
