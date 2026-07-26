import React, { useState } from 'react';
import { groupDownloadLinks } from '../../utils/helpers';
import { trackDownloadClick } from '../../services/api';
import styles from './DownloadGroup.module.css';

export default function DownloadGroup({ downloads = [], movieId = '' }) {
  const grouped = groupDownloadLinks(downloads);
  const [, setTick] = useState(0);

  const handleLinkClick = (link) => {
    trackDownloadClick(movieId, link.id, link);
    setTick(t => t + 1);
  };

  return (
    <div className={styles.container}>
      {grouped.map((group, gIdx) => (
        <div key={`${group.quality}-${gIdx}`} className={styles.group}>
          <div className={styles.groupHeader}>
            <h3 className={styles.qualityTitle}>
              <span>{group.quality}</span>
            </h3>
          </div>

          <div className={styles.linksList}>
            {group.links.map((link, lIdx) => (
              <a
                key={lIdx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.downloadBtn}
                onClick={() => handleLinkClick(link)}
              >
                <div className={styles.providerInfo}>
                  {/* Dynamic SVG Icon based on link properties */}
                  {link.useShortLink ? (
                    <span className={styles.iconShortLink} title="Short Link (Fast Speed)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </span>
                  ) : link.isCustom ? (
                    <span className={styles.iconCustomLink} title="Custom Server Link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </span>
                  ) : (
                    <span className={styles.iconDirectLink} title="Direct Server Link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </span>
                  )}
                  <span className={styles.serverNameLabel}>{link.serverName || link.name}</span>
                </div>

                <div className={styles.rightInfo}>
                  {link.clickCount > 0 && (
                    <span className={styles.clickBadge} title="Total Clicks">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {link.clickCount}
                    </span>
                  )}
                  {link.size && <span className={styles.fileSize}>{link.size}</span>}
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
