import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import { RatingBadge } from '../Badges/Badges';
import { getMovieSlug } from '../../utils/helpers';
import styles from './MovieCard.module.css';

function MovieCardComponent({ movie, isTrending = false, rank }) {
  const navigate = useNavigate();
  const { isMovieSaved, toggleSaveMovie } = useMovieContext();
  const [imgError, setImgError] = useState(false);

  if (!movie) return null;

  const saved = isMovieSaved(movie);

  const handleClick = () => {
    navigate(`/movie/${getMovieSlug(movie)}`);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    toggleSaveMovie(movie);
  };

  return (
    <div
      className={`${styles.card} ${isTrending ? styles.trendingCard : ''}`}
      onClick={handleClick}
      tabIndex="0"
      role="button"
      aria-label={`View details for ${movie.title}`}
    >
      <div className={styles.posterWrapper}>
        <div className={styles.bottomBadges}>
          {movie.rating && <RatingBadge rating={movie.rating} />}
        </div>

        <button
          className={`${styles.saveBtn} ${saved ? styles.savedActive : ''}`}
          onClick={handleSaveClick}
          aria-label={saved ? 'Remove from My List' : 'Save to My List'}
          title={saved ? 'Remove from My List' : 'Save to My List'}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill={saved ? "#E50914" : "none"}
            stroke={saved ? "#E50914" : "#ffffff"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: saved ? 'drop-shadow(0 2px 6px rgba(229, 9, 20, 0.6))' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {movie.poster && !imgError ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className={styles.posterImg}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.posterPlaceholder}>
            <span>{movie.title}</span>
          </div>
        )}
      </div>

      {!isTrending && (
        <div className={styles.details}>
          <h3 className={styles.title} title={movie.title}>{movie.title}</h3>
          <div className={styles.meta}>
            {movie.releaseDate && <span>{movie.releaseDate}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(MovieCardComponent);
