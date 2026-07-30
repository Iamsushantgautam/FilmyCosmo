import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { fetchMovies, fetchMoviesProgressively, getStoredMovies, setStoredMovies, preloadPosters, fetchAllMovies } from '../services/api';
import { extractCategories, extractGenres, extractTerms, filterMovies } from '../utils/filter';
import { searchMovies } from '../utils/search';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

const MovieContext = createContext(null);

// Helper to keep ONLY title & rendering fields in memory (no persistent storage)
// Helper to keep ONLY lightweight fields in localStorage (id and poster are excluded)
function sanitizeSavedMovie(movie) {
  if (!movie || typeof movie !== 'object') return null;
  const title = movie.title || '';
  if (!title) return null;
  return {
    title,
    slug: movie.slug || '',
    releaseDate: movie.releaseDate || ''
  };
}

export function MovieProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dismissError, setDismissError] = useState(false);
  
  // React Query query for movies (in-memory caching via React Query memory cache only)
  const { 
    data: movies = [], 
    error: queryError, 
    isFetching,
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['movies'],
    queryFn: ({ signal }) => fetchMoviesProgressively({ signal }),
    staleTime: 300000,
    gcTime: 1800000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
    refetchInterval: 45000, // Silent Background Polling for New API Movies (Every 45 seconds)
  });

  const loading = isLoading && movies.length === 0;
  const isRefreshing = isFetching && movies.length > 0;
  const error = queryError ? (queryError.message || 'Failed to connect to FilmyCosmo API') : null;
  
  const [lastUpdated, setLastUpdated] = useState(null);

  // Clean up any legacy movie catalog storage items on mount (preserving saved movies in localStorage)
  useEffect(() => {
    try {
      localStorage.removeItem('filmycosmo_movies_cache');
      localStorage.removeItem('filmycosmo_movies_cache_time');
      localStorage.removeItem('filmycosmo_persistent_movies');
      localStorage.removeItem('filmycosmo_persistent_movies_v3');
      localStorage.removeItem('filmycosmo_persistent_movies_v4');
      sessionStorage.removeItem('filmycosmo_session_movies_v5');
    } catch (e) {
      // Ignore storage cleanup errors
    }
  }, []);

  // Track online/offline status and automatically trigger refetch on reconnect
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refetch();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refetch]);

  // Update lastUpdated timestamp and trigger background poster preloading when fresh movies arrive
  useEffect(() => {
    if (movies && movies.length > 0) {
      setLastUpdated(new Date());
      preloadPosters(movies, 30);
    }
  }, [movies]);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedTerm, setSelectedTerm] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  // Saved Movies (Watchlist) State using LocalStorage persistence (WITHOUT poster property)
  const [savedMovies, setSavedMovies] = useState(() => {
    try {
      const saved = localStorage.getItem('filmycosmo_saved_movies');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.map(m => sanitizeSavedMovie(m)).filter(Boolean) : [];
    } catch (e) {
      console.error('Failed to load saved movies from localStorage:', e);
      return [];
    }
  });

  // Sync savedMovies state changes directly to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('filmycosmo_saved_movies', JSON.stringify(savedMovies));
    } catch (e) {
      console.error('Failed to persist saved movies to localStorage:', e);
    }
  }, [savedMovies]);

  // Dynamically hydrate saved movies with full catalog movie objects for UI rendering
  const hydratedSavedMovies = useMemo(() => {
    return savedMovies.map(saved => {
      const fullMovie = movies.find(m => 
        (saved.slug && m.slug === saved.slug) || 
        (saved.id && String(m.id) === String(saved.id)) || 
        (saved.title && m.title === saved.title)
      );
      return fullMovie || saved;
    });
  }, [savedMovies, movies]);

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
    savedMovies: hydratedSavedMovies,
    isMovieSaved,
    toggleSaveMovie,
    refreshMovies: () => refetch(),
    resetFilters,
    isOnline,
    isRefreshing
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
