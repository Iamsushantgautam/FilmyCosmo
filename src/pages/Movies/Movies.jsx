import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import { usePagination } from '../../hooks/usePagination';
import MovieGrid from '../../components/MovieGrid/MovieGrid';
import Pagination from '../../components/Pagination/Pagination';
import { GridSkeleton } from '../../components/Skeleton/Skeleton';
import styles from './Movies.module.css';

export default function Movies() {
  const { filteredMovies, loading } = useMovieContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    items: paginatedMovies,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage
  } = usePagination(filteredMovies, 30);

  // Sync page state with URL search param e.g. ?page=2
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    if (!isNaN(pageFromUrl) && pageFromUrl > 0 && pageFromUrl !== currentPage) {
      goToPage(pageFromUrl);
    }
  }, [searchParams]);

  const handlePageChange = (page) => {
    goToPage(page);
    setSearchParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && totalItems === 0) {
    return (
      <div className="page-section">
        <GridSkeleton count={12} />
      </div>
    );
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`page-section ${styles.moviesPage}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>All Movies</h1>
        <p className={styles.subTitle}>Browse complete high-quality movie library</p>
      </div>

      <div className={styles.metaRow}>
        <span className={styles.count}>
          {totalItems > 0
            ? `Showing ${startItem} - ${endItem} of ${totalItems} Movies`
            : 'No movies found'}
        </span>
        {totalPages > 1 && (
          <span className={styles.pageIndicator}>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      <MovieGrid movies={paginatedMovies} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
