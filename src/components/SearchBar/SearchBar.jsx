import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import { RatingBadge } from '../Badges/Badges';
import { getMovieSlug } from '../../utils/helpers';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const navigate = useNavigate();
  const { isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, filteredMovies } = useMovieContext();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const inputRef = useRef(null);

  // Auto-focus input when modal opens & lock body scroll
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  // Global Keyboard Shortcuts (Escape to close, Cmd+K / Ctrl+K to open)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Debounced search query update
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  if (!isSearchOpen) return null;

  const handleSelectMovie = (movie) => {
    setIsSearchOpen(false);
    navigate(`/movie/${getMovieSlug(movie)}`);
  };

  return (
    <div className={styles.modalOverlay} onClick={() => setIsSearchOpen(false)}>
      <div className={styles.searchContainer} onClick={(e) => e.stopPropagation()}>
        {/* Simple Input Bar Header */}
        <div className={styles.inputWrapper}>
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search movies by title, category, year..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />

          {localQuery.trim() && (
            <button className={styles.clearBtn} onClick={() => setLocalQuery('')} aria-label="Clear Search">
              ✕
            </button>
          )}

          <button className={styles.closeBtn} onClick={() => setIsSearchOpen(false)} aria-label="Close Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Clean Results List */}
        <div className={styles.resultsList}>
          {localQuery.trim() && filteredMovies.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No Movies Found</h3>
              <p>No movies found matching "{localQuery}"</p>
            </div>
          ) : (
            filteredMovies.slice(0, 15).map((movie) => (
              <div 
                key={movie.id} 
                className={styles.resultItem} 
                onClick={() => handleSelectMovie(movie)}
              >
                {movie.poster ? (
                  <img 
                    src={movie.poster} 
                    alt={movie.title} 
                    className={styles.resultPoster}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.resultPosterPlaceholder} />
                )}
                <div className={styles.resultInfo}>
                  <h4 className={styles.resultTitle}>{movie.title}</h4>
                  <div className={styles.resultMeta}>
                    {movie.releaseDate && <span>{movie.releaseDate}</span>}
                    {movie.releaseDate && movie.category && <span> • </span>}
                    {movie.category && <span>{movie.category}</span>}
                    {movie.language && <span> • {movie.language}</span>}
                    {movie.rating && <span> • <RatingBadge rating={movie.rating} /></span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
