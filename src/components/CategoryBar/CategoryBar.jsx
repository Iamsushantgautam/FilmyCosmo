import React from 'react';
import { useMovieContext } from '../../context/MovieContext';
import styles from './CategoryBar.module.css';

export default function CategoryBar({ showTerms = true, showGenres = true }) {
  const {
    categories,
    genres,
    terms,
    selectedCategory,
    setSelectedCategory,
    selectedGenre,
    setSelectedGenre,
    selectedTerm,
    setSelectedTerm,
    resetFilters
  } = useMovieContext();

  return (
    <div className={styles.filterBar}>
      {/* Categories Row */}
      <div className={styles.sectionGroup}>
        <div className={styles.groupLabel}>Categories</div>
        <div className={styles.pillScroll}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.pill} ${selectedCategory === cat ? styles.activePill : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Genres Row */}
      {showGenres && genres.length > 0 && (
        <div className={styles.sectionGroup}>
          <div className={styles.groupLabel}>Genres</div>
          <div className={styles.pillScroll}>
            {genres.map((g) => (
              <button
                key={g}
                className={`${styles.pill} ${selectedGenre === g ? styles.activePill : ''}`}
                onClick={() => setSelectedGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Terms Filter Row */}
      {showTerms && terms.length > 0 && (
        <div className={styles.sectionGroup}>
          <div className={styles.groupLabel}>Popular Tags & Terms</div>
          <div className={styles.pillScroll}>
            <button
              className={`${styles.pill} ${selectedTerm === 'All' ? styles.activePill : ''}`}
              onClick={() => setSelectedTerm('All')}
            >
              All Terms
            </button>
            {terms.map((t) => (
              <button
                key={t}
                className={`${styles.pill} ${selectedTerm === t ? styles.activePill : ''}`}
                onClick={() => setSelectedTerm(t)}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
