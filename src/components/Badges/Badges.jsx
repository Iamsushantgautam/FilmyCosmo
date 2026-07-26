import React from 'react';
import styles from './Badges.module.css';

export function QualityBadge({ text }) {
  if (!text) return null;
  return <span className={`${styles.badge} ${styles.quality}`}>{text}</span>;
}

export function RatingBadge({ rating }) {
  if (!rating) return null;
  return (
    <span className={`${styles.badge} ${styles.rating}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffc107" stroke="#ffc107" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      {rating}
    </span>
  );
}

export function CategoryBadge({ text }) {
  if (!text) return null;
  return <span className={`${styles.badge} ${styles.category}`}>{text}</span>;
}

export function LanguageBadge({ text }) {
  if (!text) return null;
  return <span className={`${styles.badge} ${styles.language}`}>{text}</span>;
}
