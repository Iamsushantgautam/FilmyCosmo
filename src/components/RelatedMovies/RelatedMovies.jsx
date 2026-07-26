import React, { useMemo } from 'react';
import { useMovieContext } from '../../context/MovieContext';
import { getRelatedMovies } from '../../utils/helpers';
import MovieRow from '../MovieRow/MovieRow';

export default function RelatedMovies({ currentMovie }) {
  const { movies } = useMovieContext();

  const related = useMemo(() => {
    return getRelatedMovies(currentMovie, movies, 12);
  }, [currentMovie, movies]);

  if (!related || related.length === 0) return null;

  return (
    <div style={{ marginTop: 'var(--spacing-xl)' }}>
      <MovieRow title="You May Also Like" movies={related} />
    </div>
  );
}
