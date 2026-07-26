import React from 'react';
import styles from './Pagination.module.css';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key="1" className={styles.pageBtn} onClick={() => onPageChange(1)}>
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots-start" className={styles.dots}>...</span>);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      pages.push(
        <button
          key={p}
          className={`${styles.pageBtn} ${currentPage === p ? styles.activePage : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots-end" className={styles.dots}>...</span>);
      }
      pages.push(
        <button key={totalPages} className={styles.pageBtn} onClick={() => onPageChange(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <nav className={styles.pagination} aria-label="Pagination Navigation">
      <button
        className={styles.pageBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        Previous
      </button>

      {renderPageNumbers()}

      <button
        className={styles.pageBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        Next
      </button>
    </nav>
  );
}
