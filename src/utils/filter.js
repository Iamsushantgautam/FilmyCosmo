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
 * Filter movies by active Category, Genre, and Term filters
 */
export function filterMovies(movies, { category = 'All', genre = 'All', term = 'All' } = {}) {
  if (!Array.isArray(movies)) return [];

  return movies.filter(movie => {
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
      const title = (movie.title || '').toLowerCase();
      const cat = (movie.category || '').toLowerCase();
      const lang = (movie.language || '').toLowerCase();

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
}
