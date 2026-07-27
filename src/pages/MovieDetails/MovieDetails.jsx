import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import { QualityBadge, RatingBadge, CategoryBadge, LanguageBadge } from '../../components/Badges/Badges';
import DownloadGroup from '../../components/DownloadGroup/DownloadGroup';
import RelatedMovies from '../../components/RelatedMovies/RelatedMovies';
import DownloadSection from '../../components/DownloadSection/DownloadSection';
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
  const { movies, isMovieSaved, toggleSaveMovie } = useMovieContext();
  const [copied, setCopied] = useState(false);
  const [activeImageModal, setActiveImageModal] = useState(null);

  const movie = useMemo(() => {
    if (!id || !Array.isArray(movies) || movies.length === 0) return null;
    const target = String(id).toLowerCase().trim();
    return movies.find((m) => {
      if (String(m.id).toLowerCase() === target) return true;
      if (m.slug && String(m.slug).toLowerCase() === target) return true;
      if (m.seo_slug && String(m.seo_slug).toLowerCase() === target) return true;
      if (createSlug(m.title) === target) return true;
      return false;
    }) || movies[0];
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

  if (!movie) {
    return (
      <div className={styles.notFoundWrapper}>
        <h2>Movie Not Found</h2>
        <p>The requested movie could not be located in our catalog.</p>
        <Link to="/movies" className={styles.actionBtnPrimary}>Browse All Movies</Link>
      </div>
    );
  }

  const isSaved = isMovieSaved(movie.id);
  const bgBackdrop = movie.backdrop || movie.poster || '';
  const cleanQuality = getCleanQualityText(movie.quality);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

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
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                {isSaved ? 'In Watchlist' : 'Add Watchlist'}
              </button>

              <button onClick={handleShare} className={styles.shareBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                {copied ? 'Copied Link!' : 'Share'}
              </button>
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
                {movie.rating &&
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Rating</span>
                    <RatingBadge rating={movie.rating} />
                  </div>
                }
              </div>

              {movie.starcast && movie.starcast.length > 0 && (
                <div className={styles.castBox}>
                  <span className={styles.metaLabel}>Star Cast</span>
                  <div className={styles.castPills}>
                    {movie.starcast.map((actor, idx) => (
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
