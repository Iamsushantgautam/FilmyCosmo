import React from 'react';
import styles from './Tags.module.css';

export default function Tags({ tags = [], activeTag = '', onSelectTag }) {
  if (!Array.isArray(tags) || tags.length === 0) return null;

  return (
    <div className={styles.tagContainer}>
      {tags.map((tag, index) => {
        const isSelected = activeTag && activeTag.toLowerCase() === tag.toLowerCase();
        return (
          <button
            key={`${tag}-${index}`}
            className={`${styles.tagChip} ${isSelected ? styles.activeTag : ''}`}
            onClick={() => onSelectTag && onSelectTag(tag)}
          >
            #{tag}
          </button>
        );
      })}
    </div>
  );
}
