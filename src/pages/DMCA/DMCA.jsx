import React from 'react';
import styles from '../Legal/Legal.module.css';

export default function DMCA() {
  return (
    <div className={styles.legalContainer}>
      <div className={styles.legalCard}>
        <h1 className={styles.title}>DMCA Disclaimer</h1>
        <span className={styles.lastUpdated}>Digital Millennium Copyright Act Notice</span>

        <div className={styles.disclaimerBanner}>
          <p>
            <strong>Zero File Storage Policy:</strong> FilmyCosmo strictly operates as an indexing search catalog. This website does NOT store, upload, host, or broadcast any copyrighted video files, movies, or media content on its servers. All links share content hosted on independent 3rd-party platforms.
          </p>
        </div>

        <div className={styles.section}>
          <h2>1. Copyright Compliance & Takedown Policy</h2>
          <p>
            FilmyCosmo respects the intellectual property rights of creators, producers, and copyright owners. We comply fully with the Digital Millennium Copyright Act (DMCA) and international copyright standards.
          </p>
        </div>

        <div className={styles.section}>
          <h2>2. How to File a DMCA Takedown Notice</h2>
          <p>
            If you are a copyright owner or an authorized agent thereof and believe that any link indexed on FilmyCosmo infringes upon your copyright, you may submit a formal request containing the following information:
          </p>
          <ul>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Exact URLs or movie details of the infringing link(s) on our site.</li>
            <li>Your contact details (Full name, organization, email address).</li>
            <li>A statement confirming that you are the legal owner or authorized representative.</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>3. Official DMCA Contact Email</h2>
          <p>
            Please send all official takedown notices directly to our designated copyright compliance team at:{' '}
            <a href="mailto:filmycosmo@zohomail.in" className={styles.emailLink}>
              filmycosmo@zohomail.in
            </a>
          </p>
          <p style={{ marginTop: '8px' }}>
            We guarantee to review and remove all verified infringing links within <strong>24 to 48 hours</strong> of notification.
          </p>
        </div>
      </div>
    </div>
  );
}
