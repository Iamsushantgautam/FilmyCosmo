import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../MovieCard/MovieCard';
import styles from './MovieRow.module.css';

export default function MovieRow({ title, movies = [], viewAllLink, isTrending = false }) {
  const scrollRef = useRef(null);

  if (!Array.isArray(movies) || movies.length === 0) return null;

  // Limit carousel: top 10 for trending rank style, up to 50 for standard rows
  const displayMovies = isTrending ? movies.slice(0, 10) : movies.slice(0, 50);

  return (
    <section className={`${styles.rowSection} ${isTrending ? styles.trendingRowSection : ''}`} aria-label={title}>
      <div className={styles.rowHeader}>
        <h2 className={styles.rowTitle}>
          {isTrending && <span className={styles.trendingBadgeTitle}>TOP 10</span>}
          <span>{title}</span>
        </h2>
        {viewAllLink && (
          <Link to={viewAllLink} className={styles.viewAllBtn}>
            Explore All →
          </Link>
        )}
      </div>

      <div className={styles.rowContainer}>
        <div className={`${styles.scrollTrack} ${isTrending ? styles.trendingScrollTrack : ''}`} ref={scrollRef}>
          {displayMovies.map((movie, index) => {
            const rank = index + 1;
            return (
              <div
                key={movie.id}
                className={`${styles.cardWrapper} ${isTrending ? styles.trendingCardWrapper : ''}`}
              >
                {isTrending && (
                  <div className={styles.rankNumberBox}>
                    <svg
                      viewBox={rank >= 10 ? "0 0 125 160" : "0 0 75 160"}
                      className={styles.rankSvg}
                      aria-hidden="true"
                    >
                      <text
                        x="0"
                        y="150"
                        className={styles.rankSvgText}
                      >
                        {rank}
                      </text>
                    </svg>
                  </div>
                )}

                <div className={isTrending ? styles.trendingCardInner : ''}>
                  <MovieCard movie={movie} isTrending={isTrending} rank={rank} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
