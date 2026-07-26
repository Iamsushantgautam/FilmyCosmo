import { MAIN_CATEGORIES, isMovieInCategory } from '../config/categories';

/**
 * Extract unique categories automatically from API movies list combined with config
 */
export function extractCategories(movies) {
  const categoriesList = ['All', ...MAIN_CATEGORIES.map(c => c.name)];
  return Array.from(new Set(categoriesList));
}

/**
 * Extract unique genres automatically from API movies list
 */
export function extractGenres(movies) {
  if (!Array.isArray(movies)) return ['All'];
  const set = new Set();
  movies.forEach(m => {
    if (m && Array.isArray(m.genres)) {
      m.genres.forEach(g => {
        if (g && typeof g === 'string') set.add(g.trim());
      });
    }
  });
  return ['All', ...Array.from(set).sort()];
}

/**
 * Extract unique terms array automatically from API movies list
 */
export function extractTerms(movies) {
  if (!Array.isArray(movies)) return [];
  const set = new Set();
  const invalidKeywords = ['download', 'full movie', 'esub', 'dual audio', 'movie hd', 'filmycosmo', 'http'];

  movies.forEach(m => {
    if (m && Array.isArray(m.terms)) {
      m.terms.forEach(t => {
        if (t && typeof t === 'string') {
          const clean = t.trim();
          const lower = clean.toLowerCase();
          const isInvalid = invalidKeywords.some(k => lower.includes(k)) || clean.length > 20 || clean.length < 2;
          if (!isInvalid) {
            set.add(clean);
          }
        }
      });
    }
  });
  return Array.from(set).sort();
}

/**
 * Extract base title key for grouping related movies / sequels / same title movies
 */
export function getBaseTitleKey(title = '') {
  if (!title || typeof title !== 'string') return '';
  return title
    .toLowerCase()
    .replace(/\(\d{4}\)/g, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\{[^}]+\}/g, '')
    .replace(/:\s*.*/g, '')
    .replace(/-\s*.*/g, '')
    .replace(/\b(returns|again|reloaded|chapter|part|season|series|collection|trilogy|edition)\b.*/gi, '')
    .replace(/[\d\s._-]+$/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Group movies with same title or base title together, ordered chronologically by release year
 */
export function groupAndSortSameTitleMovies(movies) {
  if (!Array.isArray(movies) || movies.length <= 1) return movies;

  const getYearNum = (m) => {
    const raw = String(m.releaseDate || m.year || m.movie_year || '');
    const match = raw.match(/\b(19\d\d|20\d\d)\b/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Map base keys to matching movies list
  const baseKeyMap = new Map();
  movies.forEach(m => {
    if (!m) return;
    const key = getBaseTitleKey(m.title);
    if (key && key.length >= 2) {
      if (!baseKeyMap.has(key)) baseKeyMap.set(key, []);
      baseKeyMap.get(key).push(m);
    }
  });

  // Collect keys that have multiple movies and sort within group by year
  const groupedKeys = new Set();
  baseKeyMap.forEach((list, key) => {
    if (list.length > 1) {
      list.sort((a, b) => getYearNum(a) - getYearNum(b));
      groupedKeys.add(key);
    }
  });

  // Construct result list grouping same-title movies together
  const result = [];
  const processedIds = new Set();

  movies.forEach(m => {
    if (!m || processedIds.has(m.id)) return;

    const key = getBaseTitleKey(m.title);
    if (key && groupedKeys.has(key)) {
      const groupMovies = baseKeyMap.get(key);
      groupMovies.forEach(gm => {
        if (!processedIds.has(gm.id)) {
          processedIds.add(gm.id);
          result.push(gm);
        }
      });
    } else {
      processedIds.add(m.id);
      result.push(m);
    }
  });

  return result;
}

/**
 * Filter movies by active Category, Genre, and Term filters
 */
export function filterMovies(movies, { category = 'All', genre = 'All', term = 'All' } = {}) {
  if (!Array.isArray(movies)) return [];

  const filtered = movies.filter(movie => {
    if (!movie) return false;

    // Filter Category
    if (category && category !== 'All') {
      if (!isMovieInCategory(movie, category)) {
        return false;
      }
    }

    // Filter Genre
    if (genre && genre !== 'All') {
      const genreLower = genre.toLowerCase().trim();
      const genresList = Array.isArray(movie.genres) ? movie.genres.map(g => String(g).toLowerCase()) : [];
      const termsList = Array.isArray(movie.terms) ? movie.terms.map(t => String(t).toLowerCase()) : [];

      const matchesGenre = genresList.some(g => g.includes(genreLower)) ||
                           termsList.some(t => t.includes(genreLower));
      if (!matchesGenre) {
        return false;
      }
    }

    // Filter Term
    if (term && term !== 'All') {
      const termLower = term.toLowerCase().trim();
      const termsList = Array.isArray(movie.terms) ? movie.terms.map(t => String(t).toLowerCase()) : [];
      const title = String(movie.title || '').toLowerCase();
      const cat = String(movie.category || '').toLowerCase();
      const lang = String(movie.language || '').toLowerCase();

      const matchesTerm = termsList.some(t => t.includes(termLower)) ||
                          title.includes(termLower) ||
                          cat.includes(termLower) ||
                          lang.includes(termLower);

      if (!matchesTerm) {
        return false;
      }
    }

    return true;
  });

  return groupAndSortSameTitleMovies(filtered);
}

