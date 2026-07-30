import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import { QualityBadge, RatingBadge, CategoryBadge, LanguageBadge } from '../../components/Badges/Badges';
import DownloadGroup from '../../components/DownloadGroup/DownloadGroup';
import RelatedMovies from '../../components/RelatedMovies/RelatedMovies';
import DownloadSection from '../../components/DownloadSection/DownloadSection';
import { HeroSkeleton, GridSkeleton } from '../../components/Skeleton/Skeleton';
import { createSlug } from '../../utils/helpers';
import styles from './MovieDetails.module.css';

/**
 * Clean dirty backend quality strings into concise badge titles
 */
function getCleanQualityText(rawQuality) {
  if (!rawQuality) return 'HD';
  const str = String(rawQuality).toUpperCase();
  if (str.includes('4K') || str.includes('2160P')) return '4K Ultra HD';
  if (str.includes('1080P')) return '1080p Full HD';
  if (str.includes('720P')) return '720p HD';
  if (str.includes('480P')) return '480p SD';
  if (str.includes('HEVC')) return 'HEVC 10-Bit';
  if (str.includes('WEB-DL') || str.includes('WEBDL')) return 'WEB-DL';
  if (str.includes('HDRIP')) return 'HDRip';
  return 'HD Quality';
}

export default function MovieDetails() {
  const { id } = useParams();
  const { movies, loading, isMovieSaved, toggleSaveMovie } = useMovieContext();
  const [activeImageModal, setActiveImageModal] = useState(null);

  const movie = useMemo(() => {
    if (!Array.isArray(movies) || movies.length === 0) return null;
    if (!id) return movies[0];

    const rawTarget = String(id).trim();
    const target = rawTarget.toLowerCase();
    let decodedTarget = '';
    try {
      decodedTarget = decodeURIComponent(rawTarget).toLowerCase();
    } catch (e) {
      decodedTarget = target;
    }

    const match = movies.find((m) => {
      if (!m) return false;
      const mId = String(m.id || '').toLowerCase();
      const mSlug = String(m.slug || '').toLowerCase();
      const mSeoSlug = String(m.seo_slug || '').toLowerCase();
      const mTitleSlug = createSlug(m.title || '').toLowerCase();

      return (
        mId === target ||
        mSlug === target ||
        mSeoSlug === target ||
        mTitleSlug === target ||
        (decodedTarget && (mSlug === decodedTarget || mTitleSlug === decodedTarget))
      );
    });

    return match || movies[0];
  }, [id, movies]);

  const screenshotsList = useMemo(() => {
    if (!movie) return [];
    if (Array.isArray(movie.screenshots) && movie.screenshots.length > 0) {
      return movie.screenshots;
    }
    if (movie.backdrop && movie.backdrop !== movie.poster) {
      return [movie.backdrop];
    }
    return [];
  }, [movie]);

  const genresList = useMemo(() => {
    if (!movie) return [];
    if (Array.isArray(movie.genres) && movie.genres.length > 0) return movie.genres;
    if (typeof movie.genres === 'string' && movie.genres.trim()) {
      return movie.genres.split(/[,/|]+/).map(g => g.trim()).filter(Boolean);
    }
    return [];
  }, [movie]);

  const castList = useMemo(() => {
    if (!movie) return [];
    if (Array.isArray(movie.starcast) && movie.starcast.length > 0) return movie.starcast;
    if (typeof movie.starcast === 'string' && movie.starcast.trim()) {
      return movie.starcast.split(/[,/|]+/).map(c => c.trim()).filter(Boolean);
    }
    return [];
  }, [movie]);

  if (loading || !movie) {
    return (
      <div className="page-section" style={{ paddingTop: '40px' }}>
        <HeroSkeleton />
        <GridSkeleton count={8} />
      </div>
    );
  }

  const isSaved = isMovieSaved(movie);
  const bgBackdrop = movie.backdrop || movie.poster || '';
  const cleanQuality = getCleanQualityText(movie.quality);

  const scrollToDownloads = () => {
    const el = document.getElementById('download-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Dynamic Backdrop & Hero Section */}
      <div
        className={styles.backdropHeader}
        style={{ backgroundImage: bgBackdrop ? `url(${bgBackdrop})` : 'none' }}
      >
        <div className={styles.backdropOverlay} />

        <div className={styles.detailsContainer}>
          {/* Left Poster Column */}
          <div className={styles.posterCol}>
            <div className={styles.posterCard}>
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className={styles.posterImg}
                  loading="eager"
                />
              ) : (
                <div className={styles.posterFallback}>
                  <span>{movie.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Info Column */}
          <div className={styles.infoCol}>
            {/* Movie Title */}
            <h1 className={styles.title}>{movie.title}</h1>

            {/* Synopsis */}
            {movie.description && <p className={styles.synopsis}>{movie.description}</p>}

            {/* Interactive Quick Action Buttons */}
            <div className={styles.actionsRow}>
              <button onClick={scrollToDownloads} className={styles.downloadBtnMain}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Links
              </button>

              <button
                onClick={() => toggleSaveMovie(movie)}
                className={`${styles.watchlistBtn} ${isSaved ? styles.savedActive : ''}`}
                aria-label={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isSaved ? "#ffffff" : "none"}
                  stroke={isSaved ? "#ffffff" : "currentColor"}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                {isSaved ? 'In Watchlist' : 'Add Watchlist'}
              </button>

              {movie.rating && (
                <div className={styles.ratingActionBox}>
                  <RatingBadge rating={movie.rating} />
                </div>
              )}
            </div>

            {/* Glassmorphic Metadata Card */}
            <div className={styles.metaCard}>
              <div className={styles.metaGrid}>
                {movie.releaseDate && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Release Year</span>
                    <span className={styles.metaValue}>{movie.releaseDate}</span>
                  </div>
                )}
                {movie.duration && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Duration</span>
                    <span className={styles.metaValue}>{movie.duration}</span>
                  </div>
                )}
                {genresList.length > 0 && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Genres</span>
                    <span className={styles.metaValue}>{genresList.join(', ')}</span>
                  </div>
                )}
                {movie.language && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Language</span>
                    <span className={styles.metaValue}>{movie.language}</span>
                  </div>
                )}
                {movie.category && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Category</span>
                    <span className={styles.metaValue}>{movie.category}</span>
                  </div>
                )}
                {movie.movieType && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Type</span>
                    <span className={styles.metaValue}>{movie.movieType}</span>
                  </div>
                )}
              </div>

              {castList.length > 0 && (
                <div className={styles.castBox}>
                  <span className={styles.metaLabel}>Star Cast</span>
                  <div className={styles.castPills}>
                    {castList.map((actor, idx) => (
                      <span key={idx} className={styles.castPill}>{actor}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Screenshots, Downloads & Related Movies */}
      <div className="page-section">
        {/* Movie Screenshots Section */}
        {screenshotsList.length > 0 && (
          <div className={styles.screenshotsSection}>
            <div className={styles.sectionHeaderCentered}>
              <h2 className={styles.sectionHeadingCentered}>
                <span> Screenshots</span>
              </h2>
            </div>

            <div className={styles.screenshotsGridCentered}>
              {screenshotsList.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className={styles.screenshotCardClean}
                  onClick={() => setActiveImageModal(imgUrl)}
                >
                  <img
                    src={imgUrl}
                    alt={`${movie.title} screenshot ${idx + 1}`}
                    className={styles.screenshotImgClean}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download Options Section */}
        <DownloadSection movie={movie} hasScreenshots={screenshotsList.length > 0} />

        {/* Priority Related Movies */}
        <div style={{ marginTop: '50px' }}>
          <RelatedMovies currentMovie={movie} />
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {activeImageModal && (
        <div className={styles.lightboxOverlay} onClick={() => setActiveImageModal(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxCloseBtn} onClick={() => setActiveImageModal(null)}>×</button>
            <img src={activeImageModal} alt="Screenshot Preview" className={styles.lightboxImg} />
          </div>
        </div>
      )}
    </div>
  );
}
