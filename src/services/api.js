import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Normalize real FilmyCosmo API payload schema
 */
export function normalizeMovie(item, index) {
  if (!item || typeof item !== 'object') return null;

  // Filter: Show ONLY movies where movie_show is true (skip if movie_show is false)
  if (item.movie_show !== undefined && item.movie_show !== null) {
    const isShow = item.movie_show === true || item.movie_show === 'true';
    if (!isShow) return null;
  }

  // Extract ID
  const id = item._id || item.id || item.seo_slug || `movie-${index}`;

  // Extract Real Movie Title (FilmyCosmo API field: movie_name)
  const title = item.movie_name || item.seo_title || item.title || item.name || '';
  if (!title) return null; // Ignore invalid entries without real title

  // Extract Real Poster, Backdrop & Screenshots (FilmyCosmo API fields: movie_poster, movie_screenshots)
  let screenshots = [];
  if (Array.isArray(item.movie_screenshots) && item.movie_screenshots.length > 0) {
    screenshots = item.movie_screenshots.map(s => (typeof s === 'string' && s.startsWith('//')) ? 'https:' + s : s).filter(Boolean);
  } else if (Array.isArray(item.screenshots) && item.screenshots.length > 0) {
    screenshots = item.screenshots.map(s => (typeof s === 'string' && s.startsWith('//')) ? 'https:' + s : s).filter(Boolean);
  }

  let poster = item.movie_poster || item.poster || item.image || item.thumbnail || '';
  if (!poster && screenshots.length > 0) {
    poster = screenshots[0];
  }

  let backdrop = screenshots.length > 0 ? screenshots[0] : poster;

  if (poster && poster.startsWith('//')) poster = 'https:' + poster;
  if (backdrop && backdrop.startsWith('//')) backdrop = 'https:' + backdrop;

  // Extract Real Genres (FilmyCosmo API field: movie_genre)
  let genres = [];
  if (Array.isArray(item.movie_genre)) {
    genres = item.movie_genre.map(g => String(g).trim()).filter(Boolean);
  } else if (Array.isArray(item.genres)) {
    genres = item.genres.map(g => String(g).trim()).filter(Boolean);
  } else if (typeof item.movie_genre === 'string') {
    genres = item.movie_genre.split(/[,/|]+/).map(g => g.trim()).filter(Boolean);
  } else if (typeof item.genres === 'string') {
    genres = item.genres.split(/[,/|]+/).map(g => g.trim()).filter(Boolean);
  }

  // Extract Real Category (FilmyCosmo API field: movie_category)
  let category = '';
  if (Array.isArray(item.movie_category) && item.movie_category.length > 0) {
    category = item.movie_category.map(c => String(c).trim()).filter(Boolean).join(' / ');
  } else if (typeof item.movie_category === 'string' && item.movie_category.trim()) {
    category = item.movie_category.trim();
  } else if (Array.isArray(item.category) && item.category.length > 0) {
    category = item.category.map(c => String(c).trim()).filter(Boolean).join(' / ');
  } else if (item.category) {
    category = String(item.category).trim();
  }

  // Extract Real Movie Type (FilmyCosmo API field: movie_type)
  let movieType = '';
  if (Array.isArray(item.movie_type) && item.movie_type.length > 0) {
    movieType = item.movie_type.map(t => String(t).trim()).filter(Boolean).join(' / ');
  } else if (typeof item.movie_type === 'string' && item.movie_type.trim()) {
    movieType = item.movie_type.trim();
  } else if (Array.isArray(item.type) && item.type.length > 0) {
    movieType = item.type.map(t => String(t).trim()).filter(Boolean).join(' / ');
  } else if (item.type) {
    movieType = String(item.type).trim();
  }

  // Extract Real Language (FilmyCosmo API field: movie_language)
  let language = '';
  if (Array.isArray(item.movie_language)) {
    language = item.movie_language.map(l => String(l).trim()).filter(Boolean).join(' + ');
  } else if (typeof item.movie_language === 'string') {
    language = item.movie_language.trim();
  } else if (Array.isArray(item.language)) {
    language = item.language.map(l => String(l).trim()).filter(Boolean).join(' + ');
  } else if (item.language) {
    language = String(item.language).trim();
  }

  // Extract Real Tags & Terms (FilmyCosmo API fields: movie_tags, terms)
  let terms = [];
  if (Array.isArray(item.movie_tags)) {
    terms.push(...item.movie_tags.map(t => String(t)));
  } else if (typeof item.movie_tags === 'string') {
    terms.push(...item.movie_tags.split(/[,/|]+/));
  }
  if (Array.isArray(item.terms)) {
    terms.push(...item.terms.map(t => String(t)));
  } else if (typeof item.terms === 'string') {
    terms.push(...item.terms.split(/[,/|]+/));
  }
  if (genres.length > 0) terms.push(...genres);
  if (typeof language === 'string' && language.trim()) {
    terms.push(...language.split(/[\s+/,-]+/));
  }
  if (item.movie_year) terms.push(String(item.movie_year));

  // Filter out long title strings, search sentences, or invalid keywords
  const invalidSubstrings = ['download', 'full movie', 'esub', 'dual audio', 'movie hd', 'filmycosmo', 'http'];
  terms = Array.from(new Set(
    terms
      .map(t => String(t).trim())
      .filter(t => {
        if (!t || t.length < 2 || t.length > 20) return false;
        const lower = t.toLowerCase();
        return !invalidSubstrings.some(k => lower.includes(k));
      })
  ));

  // Extract Real Download Links (FilmyCosmo API field: download_links, short_links)
  let downloads = [];
  if (Array.isArray(item.download_links) && item.download_links.length > 0) {
    downloads = item.download_links.filter(link => link && link.is_active !== false);
  } else if (Array.isArray(item.short_links) && item.short_links.length > 0) {
    downloads = item.short_links;
  } else if (Array.isArray(item.downloads)) {
    downloads = item.downloads;
  }

  // Extract Quality from download links or movie_size
  let quality = item.movie_size || 'HD';
  if (downloads.length > 0 && downloads[0].quality) {
    quality = downloads[0].quality;
  }

  const slug = item.seo_slug || item.slug || title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') || String(id);

  return {
    id: String(id),
    slug: String(slug),
    title,
    description: item.movie_description || item.meta_description || item.description || '',
    poster,
    backdrop,
    screenshots,
    releaseDate: item.movie_year ? String(item.movie_year) : (item.year ? String(item.year) : ''),
    duration: item.movie_duration || item.duration || '',
    genres: genres.length > 0 ? genres : (terms.length > 0 ? [terms[0]] : []),
    category: category || 'Movies',
    movieType: movieType || 'Movie',
    language: language,
    country: item.country,
    quality,
    rating: item.movie_rating ? String(item.movie_rating) : (item.rating ? String(item.rating) : ''),
    views: item.movie_rating_count || item.views || 0,
    starcast: Array.isArray(item.movie_starcast) ? item.movie_starcast : [],
    terms,
    tags: Array.isArray(item.movie_tags) ? item.movie_tags : [],
    downloads,
    isTrending: Boolean(item.trending === true || item.trending === 'true' || item.is_trending === true || item.is_trending === 'true'),
    isRecent: Boolean(item.isRecent || item.movie_show),
    movieShow: true
  };
}

// High-performance In-Memory API Cache (Movie catalog is in-memory only)
const memoryCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

/**
 * Clean up legacy movie catalog storage items and return empty array
 */
export function getStoredMovies() {
  try {
    localStorage.removeItem('filmycosmo_persistent_movies_v4');
    localStorage.removeItem('filmycosmo_persistent_movies');
    localStorage.removeItem('filmycosmo_persistent_movies_v3');
    localStorage.removeItem('filmycosmo_movies_cache');
    localStorage.removeItem('filmycosmo_movies_cache_time');
    sessionStorage.removeItem('filmycosmo_session_movies_v5');
  } catch (e) {
    // Ignore storage cleanup errors
  }
  return [];
}

/**
 * No-op function: Movies are not stored in localStorage
 */
export function setStoredMovies(movies) {
  // Movies are stored in memory only
}

/**
 * Get item from in-memory cache
 */
function getCachedData(key) {
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);
    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return entry.data;
    }
  }
  return null;
}

function setCachedData(key, data) {
  const prevEntry = memoryCache.get(key);
  let finalData = data;
  if (prevEntry && Array.isArray(prevEntry.data) && Array.isArray(data)) {
    finalData = diffAndMergeMovies(prevEntry.data, data);
  }
  const entry = { data: finalData, timestamp: Date.now() };
  memoryCache.set(key, entry);
  return finalData;
}

/**
 * Preload poster images into browser cache for instant rendering
 */
export function preloadPosters(movies = [], limit = 15) {
  if (!Array.isArray(movies) || movies.length === 0) return;
  const sliced = movies.slice(0, limit);
  setTimeout(() => {
    sliced.forEach(m => {
      if (m && m.poster) {
        const img = new Image();
        img.src = m.poster;
      }
    });
  }, 50);
}

/**
 * Fetch top trending movies directly from FilmyCosmo API (/api/movies?trending=true)
 */
export async function fetchTrendingMovies(limit = 10, signal) {
  const cacheKey = `trending_movies_${limit}`;

  const cached = getCachedData(cacheKey);
  if (cached) {
    preloadPosters(cached, limit);
    return cached;
  }

  try {
    const response = await apiClient.get('/movies', {
      params: { trending: 'true', limit },
      signal
    });
    const data = response.data;

    let rawList = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && data.success && Array.isArray(data.data)) {
      rawList = data.data;
    } else if (data && Array.isArray(data.movies)) {
      rawList = data.movies;
    } else if (data && Array.isArray(data.data)) {
      rawList = data.data;
    }

    const normalized = rawList.map((item, idx) => normalizeMovie(item, idx)).filter(Boolean);
    setCachedData(cacheKey, normalized);
    preloadPosters(normalized, limit);
    return normalized;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Trending fetch canceled:', error.message);
    } else {
      console.error('Failed to fetch trending movies from API:', error);
    }
    return [];
  }
}

/**
 * Fetch movies from FilmyCosmo API with fast caching and page support
 */
export async function fetchMovies(page = null, limit = 30, signal) {
  const cacheKey = page !== null ? `page_${page}_${limit}` : `all_movies_${limit}`;

  const cached = getCachedData(cacheKey);
  if (cached) {
    preloadPosters(cached, 15);
    return cached;
  }

  if (page !== null && page !== undefined) {
    try {
      const response = await apiClient.get('/movies', { params: { page, limit }, signal });
      const data = response.data;

      let rawList = [];
      if (Array.isArray(data)) {
        rawList = data;
      } else if (data && data.success && Array.isArray(data.data)) {
        rawList = data.data;
      } else if (data && Array.isArray(data.movies)) {
        rawList = data.movies;
      } else if (data && Array.isArray(data.data)) {
        rawList = data.data;
      }

      const normalized = rawList.map((item, idx) => normalizeMovie(item, idx)).filter(Boolean);
      setCachedData(cacheKey, normalized);
      preloadPosters(normalized, 15);
      return normalized;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error(`Failed to fetch page ${page} from FilmyCosmo API:`, error);
      }
      throw error;
    }
  }

  return fetchAllMoviesPaginated(limit, signal);
}

/**
 * Progressive fast loader
 */
export async function fetchMoviesProgressively({ onProgress, onComplete, limit = 30, signal }) {
  const cacheKey = `all_movies_${limit}`;

  const cached = getCachedData(cacheKey);
  if (cached && cached.length > 0) {
    onProgress(cached);
    if (onComplete) onComplete(cached);
    preloadPosters(cached, 20);
    return cached;
  }

  try {
    const firstRes = await apiClient.get('/movies', { params: { page: 1, limit }, signal });
    const firstData = firstRes.data;

    let totalPages = 1;
    let page1Raw = [];

    if (firstData && firstData.pagination && typeof firstData.pagination.totalPages === 'number') {
      totalPages = firstData.pagination.totalPages;
    } else if (firstData && typeof firstData.totalPages === 'number') {
      totalPages = firstData.totalPages;
    } else {
      totalPages = 8;
    }

    if (firstData && Array.isArray(firstData.data)) {
      page1Raw = firstData.data;
    } else if (Array.isArray(firstData)) {
      page1Raw = firstData;
    } else if (firstData && firstData.success && Array.isArray(firstData.data)) {
      page1Raw = firstData.data;
    } else if (firstData && Array.isArray(firstData.movies)) {
      page1Raw = firstData.movies;
    }

    const page1Normalized = page1Raw.map((item, idx) => normalizeMovie(item, idx)).filter(Boolean);

    setCachedData(cacheKey, page1Normalized);

    if (onProgress) {
      onProgress(page1Normalized);
    }
    preloadPosters(page1Normalized, 15);

    let allMoviesRaw = [...page1Raw];

    if (totalPages > 1) {
      const pagePromises = [];
      for (let p = 2; p <= totalPages; p++) {
        pagePromises.push(
          apiClient.get('/movies', { params: { page: p, limit }, signal })
            .then(res => res.data)
            .catch(err => {
              console.warn(`[API] Failed fetching page ${p}:`, err);
              return null;
            })
        );
      }

      const remainingResults = await Promise.all(pagePromises);
      remainingResults.forEach(resData => {
        if (resData && Array.isArray(resData.data)) {
          allMoviesRaw.push(...resData.data);
        } else if (resData && Array.isArray(resData.movies)) {
          allMoviesRaw.push(...resData.movies);
        } else if (Array.isArray(resData)) {
          allMoviesRaw.push(...resData);
        }
      });
    }

    const seenIds = new Set();
    const allNormalized = allMoviesRaw
      .map((item, idx) => normalizeMovie(item, idx))
      .filter(m => {
        if (!m || !m.id || seenIds.has(m.id)) return false;
        seenIds.add(m.id);
        return true;
      });

    setCachedData(cacheKey, allNormalized);
    preloadPosters(allNormalized, 30);

    if (onComplete) {
      onComplete(allNormalized);
    }

    return allNormalized;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
    } else {
      console.error('Progressive fetch error:', error);
    }
    throw error;
  }
}

/**
 * Fetch all movies concurrently across all pages using Promise.all
 */
export async function fetchAllMoviesPaginated(limit = 30, signal) {
  const cacheKey = `all_movies_${limit}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const firstRes = await apiClient.get('/movies', { params: { page: 1, limit }, signal });
    const firstData = firstRes.data;

    let allMoviesRaw = [];
    let totalPages = 1;

    if (firstData && firstData.pagination && typeof firstData.pagination.totalPages === 'number') {
      totalPages = firstData.pagination.totalPages;
      allMoviesRaw = Array.isArray(firstData.data) ? [...firstData.data] : [];
    } else if (Array.isArray(firstData)) {
      allMoviesRaw = firstData;
    } else if (firstData && firstData.success && Array.isArray(firstData.data)) {
      allMoviesRaw = firstData.data;
    } else if (firstData && Array.isArray(firstData.movies)) {
      allMoviesRaw = firstData.movies;
    }

    if (totalPages > 1) {
      const pagePromises = [];
      for (let p = 2; p <= totalPages; p++) {
        pagePromises.push(
          apiClient.get('/movies', { params: { page: p, limit }, signal })
            .then(res => res.data)
            .catch(err => {
              console.warn(`[API] Failed fetching page ${p}:`, err);
              return null;
            })
        );
      }

      const remainingResults = await Promise.all(pagePromises);
      remainingResults.forEach(resData => {
        if (resData && Array.isArray(resData.data)) {
          allMoviesRaw.push(...resData.data);
        } else if (resData && Array.isArray(resData.movies)) {
          allMoviesRaw.push(...resData.movies);
        } else if (Array.isArray(resData)) {
          allMoviesRaw.push(...resData);
        }
      });
    }

    const seenIds = new Set();
    const normalized = allMoviesRaw
      .map((item, idx) => normalizeMovie(item, idx))
      .filter(m => {
        if (!m || !m.id || seenIds.has(m.id)) return false;
        seenIds.add(m.id);
        return true;
      });

    setCachedData(cacheKey, normalized);
    preloadPosters(normalized, 30);
    return normalized;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
    } else {
      console.error('Failed concurrent paginated fetch:', error);
    }
    throw error;
  }
}

export function diffAndMergeMovies(prevMovies, newMovies) {
  if (!Array.isArray(prevMovies) || prevMovies.length === 0) return newMovies;
  if (!Array.isArray(newMovies) || newMovies.length === 0) return [];

  const prevMap = new Map(prevMovies.map(m => [m.id, m]));

  return newMovies.map(newMovie => {
    const prevMovie = prevMap.get(newMovie.id);
    if (!prevMovie) return newMovie;

    // Compare key fields to check for changes
    const isEquivalent =
      prevMovie.title === newMovie.title &&
      prevMovie.slug === newMovie.slug &&
      prevMovie.poster === newMovie.poster &&
      prevMovie.rating === newMovie.rating &&
      prevMovie.views === newMovie.views &&
      prevMovie.releaseDate === newMovie.releaseDate &&
      JSON.stringify(prevMovie.downloads) === JSON.stringify(newMovie.downloads);

    if (isEquivalent) {
      return prevMovie;
    }

    return { ...prevMovie, ...newMovie };
  });
}

export async function fetchAllMovies(signal) {
  return fetchAllMoviesPaginated(30, signal);
}

export async function trackDownloadClick(movieId, linkId, linkObj) {
  try {
    if (linkObj && typeof linkObj.clickCount === 'number') {
      linkObj.clickCount += 1;
    }
    await apiClient.post('/movies/click', {
      movieId: String(movieId),
      linkId: String(linkId),
      timestamp: new Date().toISOString()
    }).catch(err => {
      console.log('[Click Tracker] Silent notice:', err?.message || err);
    });
  } catch (e) {
    // Ignore click tracking failure
  }
}

export default apiClient;
