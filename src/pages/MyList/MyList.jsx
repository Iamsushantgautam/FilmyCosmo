import React from 'react';
import { Link } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import MovieGrid from '../../components/MovieGrid/MovieGrid';
import styles from './MyList.module.css';

export default function MyList() {
  const { savedMovies } = useMovieContext();

  return (
    <div className={`page-section ${styles.myListPage}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#E50914" stroke="#E50914" strokeWidth="2" style={{ marginRight: '10px', verticalAlign: 'middle' }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          My Watchlist
        </h1>
        <p className={styles.subTitle}>Your saved movies and series ({savedMovies.length})</p>
      </div>

      {savedMovies.length > 0 ? (
        <MovieGrid movies={savedMovies} />
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="1.8">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <line x1="7" y1="2" x2="7" y2="22"></line>
              <line x1="17" y1="2" x2="17" y2="22"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
            </svg>
          </div>
          <h2>Your Watchlist is Empty</h2>
          <p>Explore movies and tap the heart icon on any movie poster to save it here for quick access!</p>
          <Link to="/movies" className={styles.browseBtn}>
            Explore All Movies →
          </Link>
        </div>
      )}
    </div>
  );
}
