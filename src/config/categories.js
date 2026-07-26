import categoriesData from '../categories.json';

/**
 * Master Category Configuration Array loaded from src/categories.json
 */
export const MAIN_CATEGORIES = categoriesData;

/**
 * Helper to test if a movie belongs to a category by checking keywords
 * across Category, Title, SEO Title, Slug, Terms, Tags, Genres, Movie Type, Description, and Language fields.
 */
export function isMovieInCategory(movie, categoryTarget, options = {}) {
  if (!movie || !categoryTarget || categoryTarget === 'All') return true;

  const rawTargets = String(categoryTarget)
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (rawTargets.length === 0) return true;

  const isTagOnly = Boolean(
    options && (options.tagOnly === true || options.matchType === 'tag' || options.matchType === 'tags' || options.strictTag === true)
  );

  const termsList = Array.isArray(movie.terms) 
    ? movie.terms.map(t => String(t).toLowerCase().trim()) 
    : (typeof movie.terms === 'string' ? movie.terms.toLowerCase().split(/[,/|]+/).map(t => t.trim()) : []);

  const tagsList = Array.isArray(movie.tags) 
    ? movie.tags.map(t => String(t).toLowerCase().trim()) 
    : (typeof movie.tags === 'string' ? movie.tags.toLowerCase().split(/[,/|]+/).map(t => t.trim()) : []);

  // Strict Tag-Only Matching Mode for Special Sections
  if (isTagOnly) {
    const movieTagsAndTerms = [...tagsList, ...termsList];
    return rawTargets.some(targetKw => 
      movieTagsAndTerms.some(tag => tag === targetKw || tag.includes(targetKw))
    );
  }

  // Build complete set of target keywords to match against
  const targetKeywords = new Set(rawTargets);

  // Check if any target corresponds to a defined MAIN_CATEGORIES config entry
  rawTargets.forEach(target => {
    const config = MAIN_CATEGORIES.find(
      c => c.id.toLowerCase() === target ||
           c.name.toLowerCase() === target ||
           (Array.isArray(c.keywords) && c.keywords.some(k => k.toLowerCase() === target))
    );
    if (config && Array.isArray(config.keywords)) {
      config.keywords.forEach(kw => targetKeywords.add(kw.toLowerCase().trim()));
    }
  });

  const searchKeywords = Array.from(targetKeywords).filter(Boolean);

  // Extract all searchable text from movie object including tags, terms, and SEO fields
  const catStr = String(movie.category || '').toLowerCase();
  const titleStr = String(movie.title || '').toLowerCase();
  const seoTitleStr = String(movie.seo_title || '').toLowerCase();
  const slugStr = String(movie.slug || movie.seo_slug || '').toLowerCase();
  const langStr = String(movie.language || '').toLowerCase();
  const movieTypeStr = String(movie.movieType || movie.type || '').toLowerCase();
  const descStr = String(movie.description || '').toLowerCase();

  const genresList = Array.isArray(movie.genres) 
    ? movie.genres.map(g => String(g).toLowerCase()) 
    : (typeof movie.genres === 'string' ? movie.genres.toLowerCase().split(/[,/|]+/) : []);

  const fullSearchText = ` ${catStr} ${titleStr} ${seoTitleStr} ${slugStr} ${langStr} ${movieTypeStr} ${termsList.join(' ')} ${tagsList.join(' ')} ${genresList.join(' ')} ${descStr} `;

  // Special case for 'new' / 'newreleases' / 'recentlyadded'
  if (rawTargets.includes('new') || rawTargets.includes('newreleases') || rawTargets.includes('recentlyadded')) {
    if (movie.isRecent || movie.movieShow) return true;
    const yearNum = parseInt(movie.releaseDate || movie.movie_year || movie.year || '0', 10);
    if (yearNum >= 2024) return true;
  }

  // Precise filtering for Bollywood (exclude explicit South/Hollywood unless Bollywood is tagged)
  if (rawTargets.includes('bollywood')) {
    const isExplicitBollywood = catStr.includes('bollywood') || 
                                titleStr.includes('bollywood') || 
                                termsList.some(t => t.includes('bollywood')) || 
                                tagsList.some(t => t.includes('bollywood'));
    if (isExplicitBollywood) return true;

    const isSouthOrHollywood = catStr.includes('south') || 
                               catStr.includes('hollywood') || 
                               termsList.some(t => t.includes('south') || t.includes('hollywood') || t.includes('telugu') || t.includes('tamil') || t.includes('kannada') || t.includes('malayalam')) ||
                               tagsList.some(t => t.includes('south') || t.includes('hollywood') || t.includes('telugu') || t.includes('tamil') || t.includes('kannada') || t.includes('malayalam'));
    if (isSouthOrHollywood) return false;

    return searchKeywords.some(kw => fullSearchText.includes(kw));
  }

  // General keyword matching against any SEO/tag/category/title field
  return searchKeywords.some(kw => fullSearchText.includes(kw));
}

