import React from 'react';
import styles from '../Legal/Legal.module.css';

export default function TermsOfService() {
  return (
    <div className={styles.legalContainer}>
      <div className={styles.legalCard}>
        <h1 className={styles.title}>Terms of Service</h1>
        <span className={styles.lastUpdated}>Effective Date: July 2026</span>

        <div className={styles.disclaimerBanner}>
          <p>
            <strong>Content & Hosting Notice:</strong> FilmyCosmo does not own, store, or host any movie files or video content on its servers. All media items and links provided on this site are collected from public external websites and third-party servers.
          </p>
        </div>

        <div className={styles.section}>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using FilmyCosmo, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue using this website.
          </p>
        </div>

        <div className={styles.section}>
          <h2>2. Use of Service & Indexing</h2>
          <p>
            FilmyCosmo acts solely as an information indexer and search aggregator for movies and entertainment content available on the public internet. We do not broadcast, record, or store media files.
          </p>
        </div>

        <div className={styles.section}>
          <h2>3. External Links Disclaimer</h2>
          <p>
            This website provides outgoing hyper-links to independent external storage providers and web servers. Users follow external links at their own discretion and responsibility.
          </p>
        </div>

        <div className={styles.section}>
          <h2>4. Inquiries & Legal Contact</h2>
          <p>
            For any questions, copyright inquiries, or communications regarding these Terms, please contact our support team at{' '}
            <a href="mailto:filmycosmo@zohomail.in" className={styles.emailLink}>
              filmycosmo@zohomail.in
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
