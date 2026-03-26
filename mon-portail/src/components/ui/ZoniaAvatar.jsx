import React from 'react';
import './ZoniaAvatar.css';

/**
 * Small rounded Zonia avatar (gradient background, dark Z).
 * @param {boolean} loading - Adds pulsing animation
 * @param {string} className
 */
const ZoniaAvatar = ({ loading = false, className = '' }) => (
  <div className={`ui-zonia-avatar ${loading ? 'ui-zonia-avatar--loading' : ''} ${className}`}>
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
      <path
        d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z"
        stroke="black"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="8" fill="black" />
    </svg>
  </div>
);

export default ZoniaAvatar;
