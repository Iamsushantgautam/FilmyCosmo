import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Telegram Button */}
        <a 
          href="https://t.me/+d5jdVD4iZQcyY2M1" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.telegramBtn}
          aria-label="Join Our Telegram Channel"
        >
          <svg 
            className={styles.telegramIcon} 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.47-.01-1.37-.26-2.04-.48-.82-.27-1.47-.42-1.42-.88.03-.24.38-.49 1.07-.75 4.19-1.83 6.99-3.04 8.4-3.64 4-.17 4.83 1.16 4.67 2.45z"/>
          </svg>
          <span>Join Our Telegram Channel</span>
        </a>

        {/* Links */}
        <div className={styles.footerLinks}>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
          <Link to="/dmca">DMCA</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyrightBar}>
        © {new Date().getFullYear()} FilmyCosmo. All Rights Reserved.
      </div>
    </footer>
  );
}

