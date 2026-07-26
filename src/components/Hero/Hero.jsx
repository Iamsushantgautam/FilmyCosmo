import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QualityBadge, RatingBadge, CategoryBadge } from '../Badges/Badges';
import { getMovieSlug } from '../../utils/helpers';
import styles from './Hero.module.css';

function truncateText(str, maxLen = 120) {
  if (!str) return '';
  const cleanStr = String(str).trim();
  if (cleanStr.length <= maxLen) return cleanStr;
  return cleanStr.slice(0, maxLen).trim() + '...';
}

export default function Hero({ movies, movie, intervalMs = 4000 }) {
  const movieList = Array.isArray(movies) && movies.length > 0
    ? movies
    : (movie ? [movie] : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fade, setFade] = useState(true);

  // Swipe & Mouse Drag Handling Refs
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Rotate based on intervalMs
  useEffect(() => {
    if (movieList.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      goToNextSlide();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [movieList.length, isPaused, intervalMs, currentIndex]);

  const goToSlide = (idx) => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(idx);
      setFade(true);
    }, 150);
  };

  const goToNextSlide = () => {
    goToSlide((currentIndex + 1) % movieList.length);
  };

  const goToPrevSlide = () => {
    goToSlide((currentIndex - 1 + movieList.length) % movieList.length);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    setIsPaused(true);
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    currentXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = startXRef.current - currentXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }
    setIsPaused(false);
  };

  // Mouse Drag Handlers for Desktop
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    setIsPaused(true);
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    currentXRef.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const diff = startXRef.current - currentXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }
    setIsPaused(false);
  };

  if (movieList.length === 0) return null;

  const currentMovie = movieList[currentIndex] || movieList[0];
  const bgImage = currentMovie.backdrop || currentMovie.poster || '';

  const displayTitle = truncateText(currentMovie.title, 65);
  const displayDescription = truncateText(currentMovie.description, 130);

  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none', backgroundColor: '#111' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        handleMouseUp();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      aria-label="Featured Movie Banner"
    >
      <div className={styles.overlay}></div>

      <div className={`${styles.content} ${fade ? styles.fadeIn : styles.fadeOut}`}>
        <h1 className={styles.title} title={currentMovie.title}>{displayTitle}</h1>

        <div className={styles.badgeRow}>
          {currentMovie.rating && <RatingBadge rating={currentMovie.rating} />}
          {currentMovie.category && <CategoryBadge text={currentMovie.category} />}
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {currentMovie.releaseDate} {currentMovie.duration ? `• ${currentMovie.duration}` : ''} {currentMovie.language ? `• ${currentMovie.language}` : ''}
          </span>
        </div>

        {displayDescription && <p className={styles.description}>{displayDescription}</p>}

        <div className={styles.actions}>

          <Link to={`/movie/${getMovieSlug(currentMovie)}`} className={styles.btnDetails}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Details
          </Link>
        </div>
      </div>

      {/* Hero Carousel Navigation Dots */}
      {/* {movieList.length > 1 && (
        <div className={styles.dotsContainer}>
          {movieList.map((m, idx) => (
            <button
              key={m.id || idx}
              className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ''}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Switch to banner ${idx + 1}`}
              title={m.title}
            />
          ))}
        </div>
      )} */}
    </section>
  );
}
