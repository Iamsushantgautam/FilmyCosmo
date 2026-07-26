import { groupAndSortSameTitleMovies } from './filter';

/**
 * Debounce helper function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Fuzzy & Multi-Attribute Search Algorithm
 * Searches: Title, Category, Genres, Language, Year, Terms, Keywords, Tags
 */
export function searchMovies(movies, query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return movies;
  }

  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

  const matched = movies.filter(movie => {
    if (!movie) return false;

    const title = String(movie.title || '').toLowerCase();
    const category = String(movie.category || '').toLowerCase();
    const language = String(movie.language || '').toLowerCase();
    const year = String(movie.releaseDate || '').toLowerCase();
    const quality = String(movie.quality || '').toLowerCase();
    const description = String(movie.description || '').toLowerCase();

    const genres = Array.isArray(movie.genres) 
      ? movie.genres.map(g => String(g).toLowerCase()).join(' ') 
      : '';
      
    const terms = Array.isArray(movie.terms) 
      ? movie.terms.map(t => String(t).toLowerCase()).join(' ') 
      : '';

    const tags = Array.isArray(movie.tags) 
      ? movie.tags.map(tg => String(tg).toLowerCase()).join(' ') 
      : '';

    const searchableText = `${title} ${category} ${genres} ${language} ${year} ${quality} ${terms} ${tags} ${description}`;

    // Exact or substring match priority
    if (searchableText.includes(cleanQuery)) {
      return true;
    }

    // Match all query token parts (multi-word fuzzy search)
    return queryTokens.every(token => searchableText.includes(token));
  });

  return groupAndSortSameTitleMovies(matched);
}

