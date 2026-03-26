import React from 'react';

/**
 * Zonia "Z" SVG logo – unified across Sidebar, Login, Vitrine.
 * @param {number} size - Width & height (default 40)
 * @param {string} strokeColor - Z stroke colour (default 'white')
 * @param {string} circleColor - Center dot colour (default '#FFD700')
 */
const ZoniaLogo = ({ size = 40, strokeColor = 'white', circleColor = '#FFD700' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path
      d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z"
      stroke={strokeColor}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="50" cy="50" r="5" fill={circleColor} />
  </svg>
);

export default ZoniaLogo;
