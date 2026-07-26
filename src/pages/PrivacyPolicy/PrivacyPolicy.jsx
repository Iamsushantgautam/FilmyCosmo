import React from 'react';
import styles from '../Legal/Legal.module.css';

export default function PrivacyPolicy() {
  return (
    <div className={styles.legalContainer}>
      <div className={styles.legalCard}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <span className={styles.lastUpdated}>Effective Date: July 2026</span>

        <div className={styles.disclaimerBanner}>
          <p>
            <strong>Data Hosting Disclaimer:</strong> FilmyCosmo does not host, store, or upload any movie files or video media on its own servers. All content and links on this platform are indexed and shared from external 3rd-party servers and public sites.
          </p>
        </div>

        <div className={styles.section}>
          <h2>1. Information We Collect</h2>
          <p>
            FilmyCosmo respects user privacy. We do not require account registration, personal identity verification, or payment details to browse our catalog. We only store localized user preferences (such as your saved Watchlist) locally on your device browser.
          </p>
        </div>

        <div className={styles.section}>
          <h2>2. Third-Party Links & External Servers</h2>
          <p>
            Our website contains outbound links to independent third-party servers and file sharing platforms. FilmyCosmo has no control over external domains and is not responsible for the privacy practices, content, or services of third-party websites.
          </p>
        </div>

        <div className={styles.section}>
          <h2>3. Cookies and Analytics</h2>
          <p>
            We may use standard browser caching and local storage mechanisms to remember your site settings, theme options, and saved movies to provide a fast user experience.
          </p>
        </div>

        <div className={styles.section}>
          <h2>4. Contact Us</h2>
          <p>
            If you have any questions or inquiries regarding our Privacy Policy, please reach out to us at{' '}
            <a href="mailto:filmycosmo@zohomail.in" className={styles.emailLink}>
              filmycosmo@zohomail.in
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
