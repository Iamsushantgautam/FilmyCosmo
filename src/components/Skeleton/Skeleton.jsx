import React from 'react';
import styles from './Skeleton.module.css';

export function HeroSkeleton() {
  return <div className={`${styles.skeletonPulse} ${styles.heroSkeleton}`} />;
}

export function CardSkeleton() {
  return <div className={`${styles.skeletonPulse} ${styles.cardSkeleton}`} />;
}

export function GridSkeleton({ count = 12 }) {
  return (
    <div className={styles.gridSkeleton}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
