import React from 'react';
import styles from './Logo.module.css';

export default function Logo({ size = 'medium', variant = 'light', className = '' }) {
  return (
    <div className={`${styles.logoWrapper} ${styles[size]} ${styles[variant]} ${className}`}>
      <svg
        viewBox="0 0 310 65"
        className={styles.logoSvg}
        aria-label="FilmyCosmo"
      >
        <defs>
          {/* Gradients for 3D Origami Red F Icon */}
          <linearGradient id="fGradTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF383F" />
            <stop offset="100%" stopColor="#E50914" />
          </linearGradient>
          <linearGradient id="fGradMid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E50914" />
            <stop offset="100%" stopColor="#B20710" />
          </linearGradient>
          <linearGradient id="fGradShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B20710" />
            <stop offset="100%" stopColor="#700004" />
          </linearGradient>
        </defs>

        {/* --- 3D Origami Red F Icon --- */}
        <g transform="translate(0, 2)">
          {/* Top Flag Facet */}
          <polygon points="6,6 44,6 33,24 6,24" fill="url(#fGradTop)" />
          <polygon points="44,6 33,24 44,24" fill="#FF5259" />

          {/* Middle Bar */}
          <polygon points="19,30 38,30 29,43 19,43" fill="url(#fGradMid)" />
          <polygon points="38,30 29,43 38,43" fill="#E50914" />

          {/* Main Vertical Stem & Facet */}
          <polygon points="6,6 19,24 19,60 6,60" fill="url(#fGradShadow)" />
          <polygon points="6,48 19,43 19,60" fill="#520003" />
        </g>

        {/* --- "ilmy" Text (Crimson Red) --- */}
        <text
          x="46"
          y="49"
          fill="#E50914"
          fontFamily="'Montserrat', 'Inter', 'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="44"
          letterSpacing="-1.2px"
        >
          ilmy
        </text>

        {/* --- "Cosm" Text (Theme White / Dark) --- */}
        <text
          x="136"
          y="49"
          className={styles.cosmoText}
          fontFamily="'Montserrat', 'Inter', 'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="44"
          letterSpacing="-1.2px"
        >
          Cosm
        </text>

        {/* --- Film Reel "o" Icon --- */}
        <g transform="translate(276, 36)">
          {/* Main Red Reel Circle */}
          <circle cx="0" cy="0" r="15" fill="#E50914" />

          {/* 4 White Film Reel Holes */}
          <circle cx="-5.8" cy="-5.8" r="2.8" fill="#FFFFFF" />
          <circle cx="5.8" cy="-5.8" r="2.8" fill="#FFFFFF" />
          <circle cx="-5.8" cy="5.8" r="2.8" fill="#FFFFFF" />
          <circle cx="5.8" cy="5.8" r="2.8" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />

          {/* Curved Red Film Strip Arc Underneath */}
          <path
            d="M -18 13 Q 0 24 18 13"
            fill="none"
            stroke="#E50914"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* White Perforation Line */}
          <path
            d="M -15 14 Q 0 24 15 14"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeDasharray="1.8,2.4"
          />
        </g>
      </svg>
    </div>
  );
}
