import React from 'react';
import { useMovieContext } from '../../context/MovieContext';
import { isMovieInCategory } from '../../config/categories';
import { groupAndSortSameTitleMovies } from '../../utils/filter';
import sectionsData from '../../sections.json';
import featuredConfig from '../../featured.json';
import Hero from '../../components/Hero/Hero';
import MovieRow from '../../components/MovieRow/MovieRow';
import { HeroSkeleton, GridSkeleton } from '../../components/Skeleton/Skeleton';
import styles from './Home.module.css';

export default function Home() {
  const {
    movies,
    loading,
    error,
    heroMovie,
    trendingMovies,
    recentlyAddedMovies,
    savedMovies,
    refreshMovies
  } = useMovieContext();

  // Dynamically resolve featured hero movies based on featured.json config
  const getHeroMovies = () => {
    if (!movies || movies.length === 0) return [];
    
    // 1. Check explicit selectedMovieIds in featured.json
    if (featuredConfig.selectedMovieIds && featuredConfig.selectedMovieIds.length > 0) {
      const selected = movies.filter(m => 
        featuredConfig.selectedMovieIds.includes(String(m.id))
      );
      if (selected.length > 0) return selected;
    }

    // 2. Check featuredKeywords in featured.json
    if (featuredConfig.featuredKeywords && featuredConfig.featuredKeywords.length > 0) {
      const matched = movies.filter(m => {
        const titleLower = (m.title || '').toLowerCase();
        return featuredConfig.featuredKeywords.some(kw => titleLower.includes(kw.toLowerCase()));
      });
      if (matched.length > 0) return matched.slice(0, featuredConfig.maxItems || 8);
    }

    // 3. Fallback to trending movies list
    if (trendingMovies && trendingMovies.length > 0) {
      return trendingMovies.slice(0, featuredConfig.maxItems || 8);
    }

    return heroMovie ? [heroMovie] : movies.slice(0, featuredConfig.maxItems || 8);
  };

  // Helper function to resolve section movies list dynamically based on section config
  const getSectionMovies = (section) => {
    const limit = section.limit || 50;
    let list = [];

    if (section.type === 'trending') {
      list = trendingMovies.slice(0, limit);
    } else if (section.type === 'recentlyAdded' || section.type === 'newreleases') {
      list = recentlyAddedMovies.slice(0, limit);
    } else if (section.type === 'myList' || section.type === 'saved') {
      list = savedMovies.slice(0, limit);
    } else if (section.category || section.type === 'category') {
      list = movies.filter(m => isMovieInCategory(m, section.category, section)).slice(0, limit);
    }

    return groupAndSortSameTitleMovies(list);
  };

  if (loading && movies.length === 0) {
    return (
      <div className="page-section">
        <HeroSkeleton />
        <GridSkeleton count={12} />
      </div>
    );
  }

  if (error && movies.length === 0) {
    return (
      <div className={styles.errorBox}>
        <h2>Connection Error</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button className={styles.retryBtn} onClick={refreshMovies}>
          Retry API Connection
        </button>
      </div>
    );
  }

  const heroMoviesList = getHeroMovies();

  return (
    <div className={styles.homeContainer}>
      {featuredConfig.enabled !== false && heroMoviesList.length > 0 && (
        <Hero 
          movies={heroMoviesList} 
          intervalMs={featuredConfig.intervalMs || 4000} 
        />
      )}

      <div className="page-section">
        {sectionsData.map((section) => {
          const sectionMovies = getSectionMovies(section);
          if (!sectionMovies || sectionMovies.length === 0) return null;

          return (
            <MovieRow
              key={section.id}
              title={section.title}
              movies={sectionMovies}
              viewAllLink={section.viewAllLink}
              isTrending={section.type === 'trending' || section.id === 'trending'}
            />
          );
        })}
      </div>
    </div>
  );
}
