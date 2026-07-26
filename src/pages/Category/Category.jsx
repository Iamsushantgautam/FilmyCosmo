import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import { usePagination } from '../../hooks/usePagination';
import { MAIN_CATEGORIES } from '../../config/categories';
import MovieGrid from '../../components/MovieGrid/MovieGrid';
import Pagination from '../../components/Pagination/Pagination';
import { GridSkeleton } from '../../components/Skeleton/Skeleton';
import styles from './Category.module.css';

export default function Category() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const {
    filteredMovies,
    loading,
    selectedCategory,
    setSelectedCategory
  } = useMovieContext();

  // Sync route param (e.g. /category/Bollywood) with selectedCategory state
  useEffect(() => {
    if (name) {
      const matchConfig = MAIN_CATEGORIES.find(
        c => c.id.toLowerCase() === name.toLowerCase() || c.name.toLowerCase() === name.toLowerCase()
      );
      const activeName = matchConfig ? matchConfig.id : (name.charAt(0).toUpperCase() + name.slice(1));
      if (selectedCategory !== activeName) {
        setSelectedCategory(activeName);
      }
    } else {
      if (selectedCategory === 'All') {
        setSelectedCategory('Bollywood');
      }
    }
  }, [name]);

  const {
    items: paginatedMovies,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage
  } = usePagination(filteredMovies, 30);

  // Sync page state with URL query param ?page=2
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

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSidebarOpen(false);
    navigate(`/category/${catId}`);
  };

  if (loading && totalItems === 0) {
    return (
      <div className="page-section">
        <GridSkeleton count={12} />
      </div>
    );
  }

  const currentCategoryConfig = MAIN_CATEGORIES.find(c => c.id.toLowerCase() === selectedCategory.toLowerCase() || c.name.toLowerCase() === selectedCategory.toLowerCase());
  const displayCategoryName = currentCategoryConfig ? currentCategoryConfig.name : selectedCategory;
  const activeTitle = displayCategoryName.toLowerCase().includes('movie') || displayCategoryName.toLowerCase().includes('series') ? displayCategoryName : `${displayCategoryName} Movies`;

  return (
    <div className={`page-section ${styles.categoryPage}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{activeTitle}</h1>
        <p className={styles.subTitle}>Explore high-quality {displayCategoryName} movies and series</p>
      </div>

      {/* Mobile Sidebar Trigger Button */}
      <button 
        className={styles.mobileSidebarToggle} 
        onClick={() => setSidebarOpen(true)}
        aria-label="Open Category Sidebar"
      >
        <span>📂 Category: <strong>{displayCategoryName}</strong></span>
        <span>Select Category ▾</span>
      </button>

      {/* Sliding Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div className={styles.mobileSidebarOverlay} onClick={() => setSidebarOpen(false)} />
          <div className={styles.mobileSidebarDrawer}>
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>Categories</h3>
              <button className={styles.sidebarCloseBtn} onClick={() => setSidebarOpen(false)}>✕</button>
            </div>
            <div className={styles.sidebarList}>
              {MAIN_CATEGORIES.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase() || selectedCategory.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    className={`${styles.sidebarItem} ${isActive ? styles.activeSidebarItem : ''}`}
                    onClick={() => handleCategorySelect(cat.id)}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}



      <MovieGrid movies={paginatedMovies} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
