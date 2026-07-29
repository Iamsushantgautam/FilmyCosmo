import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { fetchMovies, fetchMoviesProgressively, getStoredMovies, setStoredMovies, preloadPosters } from '../services/api';
import { extractCategories, extractGenres, extractTerms, filterMovies } from '../utils/filter';
import { searchMovies } from '../utils/search';

const MovieContext = createContext(null);

// Helper to keep ONLY title & rendering fields in localStorage (id and all heavy API fields removed)
function sanitizeSavedMovie(movie) {
  if (!movie || typeof movie !== 'object') return null;
  const title = movie.title || '';
  if (!title) return null;
  return {
    title,
    slug: movie.slug || '',
    poster: movie.poster || '',
    releaseDate: movie.releaseDate || ''
  };
}

export function MovieProvider({ children }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedTerm, setSelectedTerm] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Background Data Synchronizer
  const loadMoviesData = useCallback(async (isSilent = false) => {
    if (!isSilent && movies.length === 0) {
      setLoading(true);
    }
    setError(null);

    try {
      await fetchMoviesProgressively({
        onProgress: (page1Movies) => {
          setMovies(prev => {
            if (!prev || prev.length === 0) return page1Movies;
            const existingIds = new Set(prev.map(m => m.id));
            const newItems = page1Movies.filter(m => !existingIds.has(m.id));
            if (newItems.length > 0) {
              return [...newItems, ...prev];
            }
            return prev;
          });
          setLoading(false);
        },
        onComplete: (allMovies) => {
          setMovies(prev => {
            if (!prev || prev.length === 0 || prev.length !== allMovies.length) {
              return allMovies;
            }
            return prev;
          });
          setLastUpdated(new Date());
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Error in MovieContext fetch:', err);
      if (movies.length === 0) {
        setError(err.message || 'Failed to connect to FilmyCosmo API');
      }
    } finally {
      setLoading(false);
    }
  }, [movies.length]);

  // Initial Load + Silent Background Polling for New API Movies (Every 45 seconds)
  useEffect(() => {
    let controller = new AbortController();
    
    loadMoviesData(movies.length > 0);

    const interval = setInterval(() => {
      loadMoviesData(true);
    }, 45000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [loadMoviesData, movies.length]);

  // Derived Dynamic Categories, Genres, Terms
  const categories = useMemo(() => extractCategories(movies), [movies]);
  const genres = useMemo(() => extractGenres(movies), [movies]);
  const terms = useMemo(() => extractTerms(movies), [movies]);

  // Special Collection Views (Trending, Recently Added, Hero)
  const trendingMovies = useMemo(() => {
    const explicit = movies.filter(m => m.isTrending);
    if (explicit.length >= 10) return explicit;
    const sorted = [...movies].sort((a, b) => (b.views || 0) - (a.views || 0));
    return sorted.slice(0, 10);
  }, [movies]);

  const recentlyAddedMovies = useMemo(() => {
    return [...movies].slice(0, 50);
  }, [movies]);

  const heroMovie = useMemo(() => {
    return movies.length > 0 ? movies[0] : null;
  }, [movies]);

  // Filtered + Searched Movies
  const filteredMovies = useMemo(() => {
    let result = filterMovies(movies, {
      category: selectedCategory,
      genre: selectedGenre,
      term: selectedTerm
    });

    if (searchQuery.trim()) {
      result = searchMovies(result, searchQuery);
    }

    return result;
  }, [movies, selectedCategory, selectedGenre, selectedTerm, searchQuery]);

  // Reset Filters helper
  const resetFilters = useCallback(() => {
    setSelectedCategory('All');
    setSelectedGenre('All');
    setSelectedTerm('All');
    setSearchQuery('');
  }, []);

  // LocalStorage Saved Movies State (NO id or downloads array stored)
  const [savedMovies, setSavedMovies] = useState(() => {
    try {
      const stored = localStorage.getItem('filmycosmo_saved_movies');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeSavedMovie).filter(Boolean);
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const sanitized = savedMovies.map(sanitizeSavedMovie).filter(Boolean);
      localStorage.setItem('filmycosmo_saved_movies', JSON.stringify(sanitized));
    } catch (e) {
      console.error('Error saving watchlist to localStorage:', e);
    }
  }, [savedMovies]);

  const isMovieSaved = useCallback((movieIdOrSlug) => {
    if (!movieIdOrSlug) return false;
    const target = String(typeof movieIdOrSlug === 'object' ? (movieIdOrSlug.slug || movieIdOrSlug.title || movieIdOrSlug.id) : movieIdOrSlug).toLowerCase();
    return savedMovies.some(m => {
      if (m.slug && String(m.slug).toLowerCase() === target) return true;
      if (m.title && String(m.title).toLowerCase() === target) return true;
      return false;
    });
  }, [savedMovies]);

  const toggleSaveMovie = useCallback((movie) => {
    if (!movie || (!movie.title && !movie.slug && !movie.id)) return;
    const cleanMovie = sanitizeSavedMovie(movie);
    if (!cleanMovie) return;

    setSavedMovies(prev => {
      const exists = prev.some(m => {
        if (cleanMovie.slug && m.slug && String(m.slug).toLowerCase() === String(cleanMovie.slug).toLowerCase()) return true;
        if (cleanMovie.title && m.title && String(m.title).toLowerCase() === String(cleanMovie.title).toLowerCase()) return true;
        return false;
      });

      if (exists) {
        return prev.filter(m => {
          if (cleanMovie.slug && m.slug && String(m.slug).toLowerCase() === String(cleanMovie.slug).toLowerCase()) return false;
          if (cleanMovie.title && m.title && String(m.title).toLowerCase() === String(cleanMovie.title).toLowerCase()) return false;
          return true;
        });
      } else {
        return [cleanMovie, ...prev];
      }
    });
  }, []);

  const value = {
    movies,
    filteredMovies,
    categories,
    genres,
    terms,
    loading,
    error,
    lastUpdated,
    selectedCategory,
    setSelectedCategory,
    selectedGenre,
    setSelectedGenre,
    selectedTerm,
    setSelectedTerm,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    trendingMovies,
    recentlyAddedMovies,
    heroMovie,
    savedMovies,
    isMovieSaved,
    toggleSaveMovie,
    refreshMovies: () => loadMoviesData(false),
    resetFilters
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
}

export function useMovieContext() {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovieContext must be used within a MovieProvider');
  }
  return context;
}
