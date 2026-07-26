import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import { MAIN_CATEGORIES } from '../../config/categories';
import Logo from '../Logo/Logo';
import styles from './Navbar.module.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, savedMovies } = useMovieContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Focus input when search expands
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  const handleSearchToggle = () => {
    if (searchExpanded) {
      if (searchQuery) {
        setSearchQuery('');
      } else {
        setSearchExpanded(false);
      }
    } else {
      setSearchExpanded(true);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() && location.pathname !== '/movies' && location.pathname !== '/') {
      navigate('/movies');
    }
  };

  const handleSearchClose = () => {
    setSearchQuery('');
    setSearchExpanded(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`${styles.navbarHeader} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navbarInner}>
        {/* Left Section: Brand Logo + Inline Nav Items */}
        <div className={styles.leftSection}>
          <Link to="/" className={styles.brand} aria-label="FilmyCosmo Home">
            <Logo size="medium" variant="light" />
          </Link>

          {/* Desktop Inline Menu (Netflix Style) */}
          <nav className={styles.desktopNav}>
            <Link to="/" className={`${styles.navItem} ${isActive('/') ? styles.activeNavItem : ''}`}>
              Home
            </Link>

            {MAIN_CATEGORIES.map(cat => {
              const isCatActive = location.pathname.toLowerCase() === `/category/${cat.id.toLowerCase()}`;
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className={`${styles.navItem} ${isCatActive ? styles.activeNavItem : ''}`}
                >
                  {cat.name}
                </Link>
              );
            })}

            <Link to="/my-list" className={`${styles.navItem} ${isActive('/my-list') ? styles.activeNavItem : ''}`}>
              My List {savedMovies.length > 0 && `(${savedMovies.length})`}
            </Link>

            <Link to="/movies" className={`${styles.navItem} ${isActive('/movies') ? styles.activeNavItem : ''}`}>
              All Movies
            </Link>
          </nav>
        </div>

        {/* Right Section: Desktop Search & Watchlist Actions */}
        <div className={styles.rightSection}>
          {/* Desktop Left-Expanding Inline Search Box */}
          <div className={`${styles.inlineSearchWrapper} ${searchExpanded ? styles.searchExpanded : ''}`}>
            <button
              className={styles.searchToggleBtn}
              onClick={handleSearchToggle}
              aria-label="Toggle Search"
              title="Search Movies"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <input
              ref={searchInputRef}
              type="text"
              className={styles.inlineSearchInput}
              placeholder="Titles, genres, language..."
              value={searchQuery}
              onChange={handleSearchChange}
              onBlur={() => {
                if (!searchQuery.trim()) setSearchExpanded(false);
              }}
            />

            {searchExpanded && searchQuery && (
              <button
                className={styles.searchClearBtn}
                onClick={handleSearchClose}
                aria-label="Clear search text"
              >
                ✕
              </button>
            )}
          </div>

          {/* Watchlist Quick Shortcut */}
          <Link to="/my-list" className={styles.iconBtn} aria-label="My Watchlist" title="My Watchlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={savedMovies.length > 0 ? "#E50914" : "none"} stroke={savedMovies.length > 0 ? "#E50914" : "currentColor"} strokeWidth="2.2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {savedMovies.length > 0 && <span className={styles.badgeDot}>{savedMovies.length}</span>}
          </Link>

          {/* Mobile Hamburger Drawer Trigger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Header Search Bar (Appears directly below header on mobile) */}
      <div className={styles.mobileSubHeaderBar}>
        <div className={styles.mobileSubSearchBox}>
          <svg className={styles.mobileSubSearchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className={styles.mobileSubSearchInput}
            placeholder="Search movies, genres, language..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button className={styles.mobileSubClearBtn} onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
      </div>

      {/* Mobile BackDrop Overlay */}
      {mobileOpen && (
        <div className={styles.mobileBackdrop} onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Side Nav Drawer */}
      <aside className={`${styles.mobileSideDrawer} ${mobileOpen ? styles.mobileSideDrawerOpen : ''}`}>
        <div className={styles.mobileDrawerHeader}>
          <Link to="/" className={styles.brand} onClick={() => setMobileOpen(false)}>
            <Logo size="small" variant="light" />
          </Link>
          <button className={styles.closeDrawerBtn} onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className={styles.mobileNavSection}>
          <span className={styles.mobileSectionTitle}>Navigation</span>
          <Link to="/" className={styles.mobileNavItem} onClick={() => setMobileOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '10px' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </Link>
          <Link to="/my-list" className={styles.mobileNavItem} onClick={() => setMobileOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#E50914" stroke="#E50914" strokeWidth="2" style={{ marginRight: '10px' }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            My List ({savedMovies.length})
          </Link>
          <Link to="/movies" className={styles.mobileNavItem} onClick={() => setMobileOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '10px' }}>
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <line x1="7" y1="2" x2="7" y2="22"></line>
              <line x1="17" y1="2" x2="17" y2="22"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
            </svg>
            All Movies
          </Link>
        </nav>

        <div className={styles.mobileCategoryGroup}>
          <span className={styles.mobileSectionTitle}>Categories</span>
          {MAIN_CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={styles.mobileSubItem}
              onClick={() => setMobileOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </aside>
    </header>
  );
}
