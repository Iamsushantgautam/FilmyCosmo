import React, { useState } from 'react';
import DownloadGroup from '../DownloadGroup/DownloadGroup';
import { trackDownloadClick } from '../../services/api';
import styles from './DownloadSection.module.css';

/* ─────────────────────────────────────────────
   Parse server/provider name from the label.
   Label format example:
     "🌿••• { Part-02 Ep.05-08}••~🌿 - Download 310Mb {480p-HEVC} (Fast Direct Download - (311.31 MB))"
   Strategy: find the outermost last (...) group, then:
     - strip inner size like "(311.31 MB)"
     - if contains " - ", take the part after the last " - "
     - strip trailing/leading "Download" / "Login To Download" words
───────────────────────────────────────────── */
function getServerNameFromLabel(label = '') {
  // Walk character-by-character to collect top-level (...) groups
  const groups = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < label.length; i++) {
    if (label[i] === '(') {
      if (depth === 0) start = i;
      depth++;
    } else if (label[i] === ')') {
      depth--;
      if (depth === 0 && start !== -1) {
        groups.push(label.slice(start + 1, i));
        start = -1;
      }
    }
  }

  if (!groups.length) return null;

  // Use the LAST top-level group — that's where the server name is
  let content = groups[groups.length - 1];

  // Remove nested size patterns like "(311.31 MB)" or "(311 MB)"
  content = content.replace(/\(\d+(\.\d+)?\s*(MB|GB|KB|Mb|Gb)\)/gi, '').trim();

  // Remove trailing " - " or " -" left after stripping
  content = content.replace(/\s*-\s*$/, '').trim();

  // If contains " - ", the server name is AFTER the last " - "
  if (content.includes(' - ')) {
    content = content.split(' - ').pop().trim();
  }

  // Strip leading/trailing generic download words
  content = content
    .replace(/^(Login\s+To\s+Download|Fast\s+Download|Download)\s*/i, '')
    .replace(/\s+Download$/i, '')
    .trim();

  return content.length >= 2 ? content : null;
}

/* ─────────────────────────────────────────────
   Detect whether this movie is a web-series
───────────────────────────────────────────── */
function isWebSeries(movie) {
  const cat = String(movie.category || '').toLowerCase();
  const type = String(movie.movieType || '').toLowerCase();
  return (
    cat.includes('webseries') ||
    cat.includes('web series') ||
    cat.includes('web-series') ||
    type.includes('series') ||
    type.includes('show')
  );
}

/* ─────────────────────────────────────────────
   Strip emoji / bullet / symbol noise from a string
   e.g. "🔰~•• { Part-02 Ep.05-08}••~🔰" → "Part-02 Ep.05-08"
───────────────────────────────────────────── */
function stripSymbols(str) {
  return str
    // Remove emoji (broad Unicode ranges)
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F300}-\u{1F9FF}]/gu, '')
    // Remove bullet / dot / tilde / wave decorators like • ‣ ~ ≈
    .replace(/[•‣․‥…~\u007e\u2019\u00b7\u00bb\u00ab\u203b\u2014\u2013\u2012]/g, '')
    // Remove curly / square braces
    .replace(/[{}\[\]]/g, '')
    // Collapse multiple spaces/dashes
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* ─────────────────────────────────────────────
   Extract a string episode key from the label.
   Priority:
     1. API fields: episode_number, episode, ep_no
     2. Content inside { } in label/quality  → e.g. "Part-02 Ep.05-08"
     3. Regex match for "Ep.05", "Episode 5", "E05" patterns
   Returns null if no episode info found at all.
───────────────────────────────────────────── */
function getEpisodeKey(link) {
  // 1. Explicit API fields (convert to friendly string)
  if (link.episode_number != null) return `Episode ${link.episode_number}`;
  if (link.episode != null) return `Episode ${link.episode}`;
  if (link.ep_no != null) return `Episode ${link.ep_no}`;

  const searchText = `${link.label || ''} ${link.quality || ''} ${link.name || ''} ${link.link_name || ''}`;

  // 2. Extract content inside { } — e.g. "{ Part-02 Ep.05-08}" → "Part-02 Ep.05-08"
  const braceMatch = searchText.match(/\{([^}]+)\}/);
  if (braceMatch) {
    const inside = stripSymbols(braceMatch[1]).trim();
    if (inside.length >= 2) return inside;
  }

  // 3. Fallback: parse "Ep.05", "Ep 5", "Episode 5", "E05"
  const epMatch = searchText.match(/(?:ep(?:isode)?[.\s#-]*|\bE)(\d{1,3}(?:-\d{1,3})?)/i);
  if (epMatch) return `Ep ${epMatch[1]}`;

  return null;
}


/* ─────────────────────────────────────────────
   Group episode-aware downloads:
   { [episodeNum]: { [qualityLabel]: [links] } }
───────────────────────────────────────────── */
function groupByEpisodeThenQuality(downloads) {
  const episodeMap = {}; // { epKey (string): { qualityLabel: [processedLinks] } }

  downloads.forEach((item, index) => {
    if (!item) return;
    if (item.is_active === false || item.active === false) return;

    const epKey = getEpisodeKey(item);
    if (epKey === null) return; // Only show links that have an episode identifier

    const fullTextSearch = `${item.label || ''} ${item.name || ''} ${item.link_name || ''} ${item.server || ''} ${item.provider || ''} ${item.url || ''}`.toLowerCase();
    if (fullTextSearch.includes('mirror')) return;

    const useShortLink = Boolean(item.use_short_link);
    const isCustom = Boolean(item.is_custom);
    const shortUrl = item.short_link || item.short_url || item.shortUrl || '';
    const customUrl = item.custom_link || item.custom_url || item.customUrl || '';
    const mainUrl = item.url || item.link || item.original_url || item.downloadUrl || '#';

    let linksToGenerate = [];

    if (useShortLink && !isCustom) {
      linksToGenerate.push({ url: shortUrl || mainUrl, type: 'short', name: item.label || item.name || item.link_name || 'Fast Short Link' });
    } else if (isCustom) {
      if (useShortLink && shortUrl) {
        linksToGenerate.push({ url: shortUrl, type: 'short', name: item.label || item.name || item.link_name || 'Fast Link' });
        if (customUrl || mainUrl) linksToGenerate.push({ url: customUrl || mainUrl, type: 'custom', name: item.label || item.name || item.link_name || 'Direct Link' });
      } else {
        linksToGenerate.push({ url: customUrl || mainUrl, type: 'custom', name: item.label || item.name || item.link_name || 'Custom Link' });
      }
    } else {
      linksToGenerate.push({ url: mainUrl, type: 'direct', name: item.label || item.name || item.link_name || 'Direct Link' });
    }

    // Determine quality label
    const fullText = `${item.quality || ''} ${item.resolution || ''} ${item.format || ''} ${item.label || ''} ${item.name || ''}`.toUpperCase();
    let qualityLabel = 'Standard Quality';
    if (fullText.includes('4K') || fullText.includes('2160P')) qualityLabel = '4K Ultra HD';
    else if (fullText.includes('1080P')) qualityLabel = fullText.includes('HEVC') ? '1080p HEVC' : '1080p Full HD';
    else if (fullText.includes('720P')) qualityLabel = fullText.includes('HEVC') ? '720p HEVC' : '720p HD';
    else if (fullText.includes('480P')) qualityLabel = fullText.includes('HEVC') ? '480p HEVC' : '480p SD';
    else if (item.quality && item.quality !== 'Download Links') qualityLabel = item.quality;

    if (!episodeMap[epKey]) episodeMap[epKey] = {};
    if (!episodeMap[epKey][qualityLabel]) episodeMap[epKey][qualityLabel] = [];

    linksToGenerate.forEach((gen, subIdx) => {
      // Try to extract server name from the label first; fall back to gen.name
      let serverName =
        getServerNameFromLabel(item.label || '') ||
        getServerNameFromLabel(item.name || '') ||
        gen.name ||
        'Direct Server';
      if (serverName.toLowerCase().includes('mirror')) return;
      if (gen.type === 'short' && !serverName.toLowerCase().includes('short')) serverName = `${serverName} (Short)`;

      episodeMap[epKey][qualityLabel].push({
        id: `${item._id || item.id || index}-${subIdx}`,
        name: gen.name,
        serverName,
        url: gen.url,
        linkType: gen.type,
        size: item.size || item.movie_size || '',
        clickCount: typeof item.click_count === 'number' ? item.click_count : (item.clicks || 0),
        useShortLink: gen.type === 'short',
        isCustom: gen.type === 'custom',
        rawItem: item,
      });
    });
  });

  // Sort episode keys — try numeric sort on any leading number, else alphabetical
  const qualityOrder = ['480p', '720p', '1080p', '4K', 'Standard'];
  return Object.keys(episodeMap)
    .sort((a, b) => {
      // Extract first number sequence for smart ordering ("Ep.05-08" → 5, "Part-02 Ep.01" → 1)
      const numA = parseInt((a.match(/(\d+)/) || [0, 0])[1], 10);
      const numB = parseInt((b.match(/(\d+)/) || [0, 0])[1], 10);
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    })
    .map(epKey => ({
      episode: epKey,
      qualities: Object.keys(episodeMap[epKey])
        .sort((a, b) => {
          const idxA = qualityOrder.findIndex(k => a.includes(k.replace('p', '')));
          const idxB = qualityOrder.findIndex(k => b.includes(k.replace('p', '')));
          return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        })
        .map(q => ({ quality: q, links: episodeMap[epKey][q] })),
    }));
}

/* ─────────────────────────────────────────────
   Icon helpers (reused from DownloadGroup)
───────────────────────────────────────────── */
function LinkIcon({ link }) {
  if (link.useShortLink) {
    return (
      <span className={styles.iconShortLink} title="Short Link (Fast Speed)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </span>
    );
  }
  if (link.isCustom) {
    return (
      <span className={styles.iconCustomLink} title="Custom Server">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </span>
    );
  }
  return (
    <span className={styles.iconDirectLink} title="Direct Server Link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </span>
  );
}

/* ─────────────────────────────────────────────
   Episode-grouped Download Renderer
───────────────────────────────────────────── */
function EpisodeDownloadGroup({ downloads, movieId }) {
  const grouped = groupByEpisodeThenQuality(downloads);
  const [openEpisodes, setOpenEpisodes] = useState(() => {
    // Open first episode by default
    if (grouped.length > 0) return new Set([grouped[0].episode]);
    return new Set();
  });

  const toggleEpisode = (epNum) => {
    setOpenEpisodes(prev => {
      const next = new Set(prev);
      if (next.has(epNum)) next.delete(epNum);
      else next.add(epNum);
      return next;
    });
  };

  if (grouped.length === 0) {
    return (
      <div className={styles.noDownloadsBox}>
        <p>No episode download links with episode numbers found.</p>
      </div>
    );
  }

  return (
    <div className={styles.episodeContainer}>
      {grouped.map(({ episode, qualities }) => {
        const isOpen = openEpisodes.has(episode);
        const totalLinks = qualities.reduce((acc, q) => acc + q.links.length, 0);

        return (
          <div key={episode} className={`${styles.episodeBlock} ${isOpen ? styles.episodeBlockOpen : ''}`}>
            {/* Episode Accordion Header */}
            <button
              className={styles.episodeHeader}
              onClick={() => toggleEpisode(episode)}
              aria-expanded={isOpen}
            >
              <div className={styles.episodeHeaderLeft}>
                <span className={styles.episodeLabel}>{episode}</span>
              </div>
              <svg
                className={`${styles.episodeChevron} ${isOpen ? styles.chevronOpen : ''}`}
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Quality Groups inside Episode */}
            {isOpen && (
              <div className={styles.episodeBody}>
                {qualities.map(({ quality, links }) => (
                  <div key={quality} className={styles.qualityGroup}>
                    {/* Quality Label — only shown when there are multiple quality groups */}
                    {qualities.length > 1 && (
                      <div className={styles.qualityHeader}>
                        <h4 className={styles.qualityTitle}>{quality}</h4>
                      </div>
                    )}

                    {/* Links Grid */}
                    <div className={styles.linksList}>
                      {links.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.downloadBtn}
                          onClick={() => trackDownloadClick(movieId, link.id, link)}
                        >
                          <div className={styles.providerInfo}>
                            <LinkIcon link={link} />
                            <span className={styles.serverNameLabel}>{link.serverName || link.name}</span>
                          </div>
                          <div className={styles.rightInfo}>
                            {link.clickCount > 0 && (
                              <span className={styles.clickBadge}>{link.clickCount}</span>
                            )}
                            {link.size && <span className={styles.fileSize}>{link.size}</span>}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main DownloadSection export
───────────────────────────────────────────── */
export default function DownloadSection({ movie, hasScreenshots }) {
  const series = isWebSeries(movie);
  const downloads = movie.downloads || [];

  // Check if any download link has an episode identifier
  const hasEpisodeLinks = series && downloads.some(d => getEpisodeKey(d) !== null);

  return (
    <div
      id="download-section"
      className={styles.wrapper}
      style={{ marginTop: hasScreenshots ? '50px' : '0' }}
    >
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionHeading}>
          <svg
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="var(--accent-red)" strokeWidth="2.5"
            className={styles.headingIcon}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download</span>


        </h2>
        {/* <p className={styles.sectionSub}>
          {hasEpisodeLinks
            ? 'Select an episode, then choose your preferred quality and server'
            : 'Select your preferred quality and resolution link below'}
        </p> */}
      </div>

      {/* Downloads */}
      {downloads.length > 0 ? (
        hasEpisodeLinks ? (
          <EpisodeDownloadGroup downloads={downloads} movieId={movie.id} />
        ) : (
          <DownloadGroup downloads={downloads} movieId={movie.id} />
        )
      ) : (
        <div className={styles.noDownloadsBox}>
          <p>No direct download links listed for this entry currently.</p>
        </div>
      )}
    </div>
  );
}
