import React, { useState, useEffect, useRef } from 'react';
import MovieCard from '../MovieCard/MovieCard';
import styles from './MovieGrid.module.css';

export default function MovieGrid({ movies = [], emptyMessage = "No movies found matching your filter." }) {
  const [displayMovies, setDisplayMovies] = useState(movies);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevMoviesRef = useRef(movies);

  useEffect(() => {
    // Only trigger animation if the items array actually changed content or length
    const hasChanged = movies.length !== prevMoviesRef.current.length ||
      movies.some((m, idx) => m.id !== prevMoviesRef.current[idx]?.id);

    if (hasChanged) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayMovies(movies);
        setIsTransitioning(false);
      }, 150); // Match CSS transition timing
      prevMoviesRef.current = movies;
      return () => clearTimeout(timer);
    } else {
      setDisplayMovies(movies);
    }
  }, [movies]);

  if (!Array.isArray(displayMovies) || displayMovies.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyTitle}>No Movies Found</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.grid} ${isTransitioning ? styles.gridTransitioning : ''}`}>
      {displayMovies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
