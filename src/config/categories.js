import categoriesData from '../categories.json';
import sectionsData from '../sections.json';

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
  const targetKeywords = new Set();

  rawTargets.forEach(target => {
    let foundSpecificKeywords = false;

    // 1. Match against sections.json configurations
    const sectionConfig = sectionsData.find(
      s => s.id?.toLowerCase() === target ||
           s.title?.toLowerCase() === target ||
           (s.viewAllLink && s.viewAllLink.toLowerCase() === `/category/${target}`)
    );
    if (sectionConfig && sectionConfig.category) {
      sectionConfig.category.split(',').forEach(kw => {
        const clean = kw.trim().toLowerCase();
        if (clean) {
          targetKeywords.add(clean);
          foundSpecificKeywords = true;
        }
      });
    }

    // 2. Match against MAIN_CATEGORIES config entry
    const config = MAIN_CATEGORIES.find(
      c => c.id.toLowerCase() === target ||
           c.name.toLowerCase() === target ||
           (Array.isArray(c.keywords) && c.keywords.some(k => k.toLowerCase() === target))
    );
    if (config && Array.isArray(config.keywords) && config.keywords.length > 0) {
      config.keywords.forEach(kw => {
        const clean = kw.trim().toLowerCase();
        if (clean) {
          targetKeywords.add(clean);
          foundSpecificKeywords = true;
        }
      });
    }

    // 3. Fallback: only add target string if no explicit category keywords were found
    if (!foundSpecificKeywords) {
      targetKeywords.add(target);
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

  const starcastList = Array.isArray(movie.starcast) 
    ? movie.starcast.map(s => String(s).toLowerCase().trim()) 
    : (typeof movie.starcast === 'string' ? movie.starcast.toLowerCase().split(/[,/|]+/).map(s => s.trim()) : []);

  const fullSearchText = ` ${catStr} ${titleStr} ${seoTitleStr} ${slugStr} ${langStr} ${movieTypeStr} ${termsList.join(' ')} ${tagsList.join(' ')} ${genresList.join(' ')} ${starcastList.join(' ')} ${descStr} `;

  // Strict keyword matching against the configured category keywords
  return searchKeywords.some(kw => fullSearchText.includes(kw));
}

