import React from 'react';
import MovieCard from '../MovieCard/MovieCard';
import styles from './MovieGrid.module.css';

export default function MovieGrid({ movies = [], emptyMessage = "No movies found matching your filter." }) {
  if (!Array.isArray(movies) || movies.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyTitle}>No Movies Found</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
