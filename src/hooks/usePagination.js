import { useState, useMemo, useEffect } from 'react';
import { getPaginatedData } from '../utils/pagination';

export function usePagination(items = [], initialPageSize = 30, filterKey = '') {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset to page 1 only when the filter selection changes (not on background data updates)
  useEffect(() => {
    setCurrentPage(1);
  }, [filterKey]);

  const paginatedResult = useMemo(() => {
    return getPaginatedData(items, currentPage, pageSize);
  }, [items, currentPage, pageSize]);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), paginatedResult.totalPages));
  };

  const nextPage = () => {
    if (currentPage < paginatedResult.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return {
    items: paginatedResult.data,
    currentPage: paginatedResult.currentPage,
    totalPages: paginatedResult.totalPages,
    totalItems: paginatedResult.totalItems,
    pageSize,
    setPageSize,
    goToPage,
    nextPage,
    prevPage
  };
}
