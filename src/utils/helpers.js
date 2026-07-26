/**
 * Helper to generate SEO-friendly slug from title
 */
export function createSlug(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get movie slug for SEO-friendly URLs (e.g. /movie/musafir-cafe-s01-2026-hindi)
 */
export function getMovieSlug(movie) {
  if (!movie) return '';
  if (movie.slug) return movie.slug;
  if (movie.seo_slug) return movie.seo_slug;
  const generated = createSlug(movie.title);
  return generated || String(movie.id);
}

/**
 * Helper to extract clear, concise server/provider names from raw link strings
 * e.g. "Download 410Mb {480p-HEVC} (Cloud Direct - (413.80 MB))" -> "Cloud Direct"
 */
export function extractServerName(item = {}, rawName = '') {
  if (item.server && typeof item.server === 'string' && item.server.trim()) return item.server.trim();
  if (item.provider && typeof item.provider === 'string' && item.provider.trim()) return item.provider.trim();

  let nameStr = String(rawName || item.label || item.name || item.link_name || '').trim();

  if (!nameStr) {
    nameStr = String(item.url || item.link || '');
  }

  // 1. Remove quality brackets like {480p-HEVC}, {720p-HD}, {1080p-HD}
  let cleaned = nameStr.replace(/\{[^}]+\}/g, '').trim();

  // 2. Remove leading "Download XXXMB" / "Download X.XGB"
  cleaned = cleaned.replace(/^Download\s*\d+(\.\d+)?\s*(MB|GB|KB|Mb|Gb)/i, '').trim();

  // 3. Keyword parsing for all FilmyCosmo servers
  const lower = (cleaned + ' ' + (item.url || '')).toLowerCase();
  if (lower.includes('cloud direct')) return 'Cloud Direct';
  if (lower.includes('fast direct') || lower.includes('fast download')) return 'Fast Direct';
  if (lower.includes('hubcloud')) return 'HubCloud';
  if (lower.includes('gdflix')) return 'GDFLIX';
  if (lower.includes('gofile')) return 'GoFile.io';
  if (lower.includes('slowcloud')) return 'SlowCloud';
  if (lower.includes('buzz')) return 'Buzzheavier';
  if (lower.includes('mirror')) return 'Mirror Page';
  if (lower.includes('terabox')) return 'TeraBox';
  if (lower.includes('mediafire')) return 'MediaFire';

  // 4. Fallback cleanup: remove extra parentheses, leading/trailing hyphens, and size patterns
  cleaned = cleaned
    .replace(/\(\d+(\.\d+)?\s*(MB|GB|KB|Mb|Gb)\)/gi, '')
    .replace(/[\(\)]/g, '')
    .replace(/^[-–—:\s]+|[-–—:\s]+$/g, '')
    .trim();

  if (cleaned.length >= 2) {
    return cleaned;
  }

  return 'Direct Server';
}

/**
 * Group real download links cleanly by resolution/quality
 */
export function groupDownloadLinks(downloads = []) {
  if (!Array.isArray(downloads) || downloads.length === 0) {
    return [];
  }

  const groups = {};

  downloads.forEach((item, index) => {
    if (!item) return;

    // Rule 1: MUST be active (is_active !== false)
    if (item.is_active === false || item.active === false) {
      return;
    }

    // Filter out "Mirror Page" / "Mirror" links completely as requested
    const fullTextSearch = `${item.label || ''} ${item.name || ''} ${item.link_name || ''} ${item.server || ''} ${item.provider || ''} ${item.url || ''}`.toLowerCase();
    if (fullTextSearch.includes('mirror')) {
      return;
    }

    const useShortLink = Boolean(item.use_short_link);
    const isCustom = Boolean(item.is_custom);
    const shortUrl = item.short_link || item.short_url || item.shortUrl || '';
    const customUrl = item.custom_link || item.custom_url || item.customUrl || '';
    const mainUrl = item.url || item.link || item.original_url || item.downloadUrl || '#';

    let linksToGenerate = [];

    if (useShortLink && !isCustom) {
      // Rule 2: use_short_link: true -> Show SHORT LINK ONLY
      if (shortUrl) {
        linksToGenerate.push({
          url: shortUrl,
          type: 'short',
          name: item.label || item.name || item.link_name || 'Fast Short Link'
        });
      } else {
        linksToGenerate.push({
          url: mainUrl,
          type: 'direct',
          name: item.label || item.name || item.link_name || 'Direct Link'
        });
      }
    } else if (isCustom) {
      // Rule 3: is_custom: true -> Show active custom link (+ short link if use_short_link: true)
      if (useShortLink && shortUrl) {
        linksToGenerate.push({
          url: shortUrl,
          type: 'short',
          name: item.label || item.name || item.link_name || 'Fast Link'
        });
        if (customUrl || mainUrl) {
          linksToGenerate.push({
            url: customUrl || mainUrl,
            type: 'custom',
            name: item.label || item.name || item.link_name || 'Direct Link'
          });
        }
      } else {
        linksToGenerate.push({
          url: customUrl || mainUrl,
          type: 'custom',
          name: item.label || item.name || item.link_name || 'Custom Link'
        });
      }
    } else {
      // Rule 4: Both use_short_link & is_custom are false -> Show ACTIVE DIRECT LINK ONLY
      linksToGenerate.push({
        url: mainUrl,
        type: 'direct',
        name: item.label || item.name || item.link_name || 'Direct Link'
      });
    }

    // Process generated links into quality groups
    linksToGenerate.forEach((gen, subIdx) => {
      let name = gen.name;
      let serverName = extractServerName(item, name);
      
      // Skip if serverName resolved to Mirror Page
      if (serverName.toLowerCase().includes('mirror')) {
        return;
      }

      if (gen.type === 'short' && !serverName.toLowerCase().includes('short')) {
        serverName = `${serverName} (Short)`;
      }

      let size = item.size || item.movie_size || '';
      let clickCount = typeof item.click_count === 'number' ? item.click_count : (item.clicks || 0);

      // Smart Quality Grouping
      const fullText = `${item.quality || ''} ${item.resolution || ''} ${item.format || ''} ${name}`.toUpperCase();
      
      let qualityGroup = 'Standard Quality';

      if (fullText.includes('4K') || fullText.includes('2160P')) {
        qualityGroup = '4K Ultra HD Quality';
      } else if (fullText.includes('1080P')) {
        qualityGroup = fullText.includes('HEVC') ? '1080p HEVC Quality' : '1080p Full HD Quality';
      } else if (fullText.includes('720P')) {
        qualityGroup = fullText.includes('HEVC') ? '720p HEVC Quality' : '720p HD Quality';
      } else if (fullText.includes('480P')) {
        qualityGroup = fullText.includes('HEVC') ? '480p HEVC Quality' : '480p SD Quality';
      } else if (fullText.includes('340MB') || fullText.includes('400MB') || fullText.includes('350MB')) {
        qualityGroup = '480p HEVC Quality';
      } else if (fullText.includes('610MB') || fullText.includes('600MB') || fullText.includes('650MB')) {
        qualityGroup = '720p HEVC Quality';
      } else if (fullText.includes('990MB') || fullText.includes('900MB') || fullText.includes('1.3GB') || fullText.includes('1GB')) {
        qualityGroup = '720p HD Quality';
      } else if (fullText.includes('2.2GB') || fullText.includes('3.3GB') || fullText.includes('2GB')) {
        qualityGroup = '1080p Full HD Quality';
      } else if (item.quality && item.quality !== 'Download Links') {
        qualityGroup = item.quality;
      }

      if (!groups[qualityGroup]) {
        groups[qualityGroup] = [];
      }

      groups[qualityGroup].push({
        id: `${item._id || item.id || index}-${subIdx}`,
        name,
        serverName,
        url: gen.url,
        linkType: gen.type,
        size,
        clickCount,
        isActive: true,
        useShortLink: gen.type === 'short',
        isCustom: gen.type === 'custom',
        rawItem: item
      });
    });
  });

  const qualityOrder = [
    '480p',
    '720p',
    '1080p',
    '4K',
    'Standard'
  ];

  const keys = Object.keys(groups).sort((a, b) => {
    let idxA = qualityOrder.findIndex(k => a.includes(k));
    let idxB = qualityOrder.findIndex(k => b.includes(k));
    if (idxA === -1) idxA = 99;
    if (idxB === -1) idxB = 99;
    return idxA - idxB;
  });

  return keys.map(q => ({
    quality: q,
    links: groups[q]
  }));
}

/**
 * Intelligent Related Movies Recommendation Algorithm
 * Priority: Same Category -> Same Genre -> Shared Terms
 */
export function getRelatedMovies(currentMovie, allMovies, limit = 12) {
  if (!currentMovie || !Array.isArray(allMovies)) return [];

  const candidates = allMovies.filter(m => m.id !== currentMovie.id);

  return candidates.map(movie => {
    let score = 0;

    // 1. Same Category (Weight: 10)
    if (movie.category && currentMovie.category && movie.category.toLowerCase() === currentMovie.category.toLowerCase()) {
      score += 10;
    }

    // 2. Same Genres (Weight: 5 per matching genre)
    const currentGenres = Array.isArray(currentMovie.genres) ? currentMovie.genres.map(g => g.toLowerCase()) : [];
    const movieGenres = Array.isArray(movie.genres) ? movie.genres.map(g => g.toLowerCase()) : [];
    
    currentGenres.forEach(g => {
      if (movieGenres.includes(g)) score += 5;
    });

    // 3. Shared Terms (Weight: 3 per matching term)
    const currentTerms = Array.isArray(currentMovie.terms) ? currentMovie.terms.map(t => t.toLowerCase()) : [];
    const movieTerms = Array.isArray(movie.terms) ? movie.terms.map(t => t.toLowerCase()) : [];

    currentTerms.forEach(t => {
      if (movieTerms.includes(t)) score += 3;
    });

    return { movie, score };
  })
  .sort((a, b) => b.score - a.score)
  .map(item => item.movie)
  .slice(0, limit);
}

/**
 * Image Placeholder Fallback Helper (Safe SVG Data URL)
 */
export function getImageFallback(title = 'Movie') {
  return '';
}
