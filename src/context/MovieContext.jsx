import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { fetchMovies, fetchMoviesProgressively, getStoredMovies, setStoredMovies, preloadPosters } from '../services/api';
import { extractCategories, extractGenres, extractTerms, filterMovies } from '../utils/filter';
import { searchMovies } from '../utils/search';

const MovieContext = createContext(null);

export function MovieProvider({ children }) {
  // Initialize movies synchronously from localStorage so site loads in 0ms on refresh!
  const [movies, setMovies] = useState(() => getStoredMovies());
  const [loading, setLoading] = useState(() => {
    const initial = getStoredMovies();
    return initial.length === 0;
  });
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedTerm, setSelectedTerm] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Background Stale-While-Revalidate Data Synchronizer
  const loadMoviesData = useCallback(async (isSilent = false) => {
    // Only show full loading spinner if we have ZERO stored movies
    if (!isSilent && movies.length === 0) {
      setLoading(true);
    }
    setError(null);

    try {
      await fetchMoviesProgressively({
        onProgress: (page1Movies) => {
          setMovies(prev => {
            if (!prev || prev.length === 0) return page1Movies;
            // Smoothly merge any new movies from page 1 without screen reload
            const existingIds = new Set(prev.map(m => m.id));
            const newItems = page1Movies.filter(m => !existingIds.has(m.id));
            if (newItems.length > 0) {
              const updated = [...newItems, ...prev];
              setStoredMovies(updated);
              return updated;
            }
            return prev;
          });
          setLoading(false);
        },
        onComplete: (allMovies) => {
          setMovies(prev => {
            // Check if dataset has updated or new movies added
            if (!prev || prev.length === 0 || prev.length !== allMovies.length) {
              setStoredMovies(allMovies);
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
    
    // Immediate background revalidation (0ms load from localStorage + background update)
    loadMoviesData(movies.length > 0);

    const interval = setInterval(() => {
      loadMoviesData(true); // Silent sync without page refresh or loading spinner
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
    // Fallback to top 10 movies sorted by views or catalog order
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

  // LocalStorage Saved Movies State
  const [savedMovies, setSavedMovies] = useState(() => {
    try {
      const stored = localStorage.getItem('filmycosmo_saved_movies');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('filmycosmo_saved_movies', JSON.stringify(savedMovies));
    } catch (e) {
      console.error('Error saving watchlist to localStorage:', e);
    }
  }, [savedMovies]);

  const isMovieSaved = useCallback((movieId) => {
    return savedMovies.some(m => String(m.id) === String(movieId));
  }, [savedMovies]);

  const toggleSaveMovie = useCallback((movie) => {
    if (!movie || !movie.id) return;
    setSavedMovies(prev => {
      const exists = prev.some(m => String(m.id) === String(movie.id));
      if (exists) {
        return prev.filter(m => String(m.id) !== String(movie.id));
      } else {
        return [movie, ...prev];
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
