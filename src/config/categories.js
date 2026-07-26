import categoriesData from '../categories.json';

/**
 * Master Category Configuration Array loaded from src/categories.json
 */
export const MAIN_CATEGORIES = categoriesData;

/**
 * Helper to test if a movie belongs to a category by checking keywords
 * across Category, Title, Terms, Tags, Genres, and Language fields.
 */
export function isMovieInCategory(movie, categoryTarget) {
  if (!movie || !categoryTarget || categoryTarget === 'All') return true;

  const targetLower = String(categoryTarget).toLowerCase().trim();

  // Find category in config array or match raw string
  const config = MAIN_CATEGORIES.find(
    c => c.id.toLowerCase() === targetLower || 
         c.name.toLowerCase() === targetLower ||
         c.keywords.some(k => k.toLowerCase() === targetLower)
  );

  const searchKeywords = config ? config.keywords : [targetLower];

  const catStr = (movie.category || '').toLowerCase();
  const titleStr = (movie.title || '').toLowerCase();
  const langStr = (movie.language || '').toLowerCase();
  const termsList = Array.isArray(movie.terms) ? movie.terms.map(t => String(t).toLowerCase()) : [];
  const tagsList = Array.isArray(movie.tags) ? movie.tags.map(t => String(t).toLowerCase()) : [];
  const genresList = Array.isArray(movie.genres) ? movie.genres.map(g => String(g).toLowerCase()) : [];

  const fullSearchText = `${catStr} ${titleStr} ${langStr} ${termsList.join(' ')} ${tagsList.join(' ')} ${genresList.join(' ')}`;

  // Precise filtering for Bollywood (exclude South movies & Hollywood movies)
  if (targetLower === 'bollywood' || (config && config.id === 'Bollywood')) {
    const isExplicitBollywood = catStr.includes('bollywood') || titleStr.includes('bollywood') || termsList.some(t => t.includes('bollywood'));
    if (isExplicitBollywood) return true;

    const isSouthOrHollywood = catStr.includes('south') || 
                               catStr.includes('hollywood') || 
                               termsList.some(t => t.includes('south') || t.includes('hollywood') || t.includes('telugu') || t.includes('tamil') || t.includes('kannada') || t.includes('malayalam'));
    if (isSouthOrHollywood) return false;

    return searchKeywords.some(kw => fullSearchText.includes(kw.toLowerCase()));
  }

  return searchKeywords.some(kw => fullSearchText.includes(kw.toLowerCase()));
}
