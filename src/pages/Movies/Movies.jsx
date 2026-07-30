import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import { usePagination } from '../../hooks/usePagination';
import MovieGrid from '../../components/MovieGrid/MovieGrid';
import Pagination from '../../components/Pagination/Pagination';
import { GridSkeleton } from '../../components/Skeleton/Skeleton';
import styles from './Movies.module.css';

export default function Movies() {
  const { filteredMovies, loading, searchQuery, setSearchQuery, resetFilters, selectedCategory, selectedGenre, selectedTerm } = useMovieContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync searchQuery from URL parameter if present on mount e.g. /movies?q=avatar
  useEffect(() => {
    const qFromUrl = searchParams.get('q') || searchParams.get('search');
    if (qFromUrl && qFromUrl !== searchQuery) {
      setSearchQuery(qFromUrl);
    }
  }, [searchParams]);

  const {
    items: paginatedMovies,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage
  } = usePagination(filteredMovies, 30, `${selectedCategory}_${selectedGenre}_${selectedTerm}_${searchQuery}`);

  // Sync page state with URL search param e.g. ?page=2
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    if (!isNaN(pageFromUrl) && pageFromUrl > 0 && pageFromUrl !== currentPage) {
      goToPage(pageFromUrl);
    }
  }, [searchParams]);

  const handlePageChange = (page) => {
    goToPage(page);
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('page', String(page));
      return params;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && totalItems === 0) {
    return (
      <div className="page-section">
        <GridSkeleton count={12} />
      </div>
    );
  }

  return (
    <div className={`page-section ${styles.moviesPage}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {searchQuery.trim() ? `Search Results for "${searchQuery}"` : 'All Movies'}
        </h1>
        <p className={styles.subTitle}>
          {searchQuery.trim()
            ? totalItems > 0
              ? `Found ${totalItems} movie${totalItems === 1 ? '' : 's'}`
              : `No movies found for "${searchQuery}"`
            : 'Browse complete high-quality movie library'}
        </p>
      </div>

      {totalItems === 0 && searchQuery.trim() ? (
        <div className={styles.simpleNoResults}>
          <span>Try a different search term or </span>
          <button className={styles.simpleClearBtn} onClick={resetFilters}>
            Clear Search
          </button>
        </div>
      ) : (
        <>
          <MovieGrid movies={paginatedMovies} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}


