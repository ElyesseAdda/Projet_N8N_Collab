import React from 'react';
import './Badge.css';

/**
 * Coloured badge for categories, status, counters.
 * @param {'default'|'cyan'|'gold'|'green'|'red'} variant
 * @param {string} className
 */
const Badge = ({ variant = 'default', children, className = '', ...rest }) => (
  <span className={`ui-badge ui-badge--${variant} ${className}`} {...rest}>
    {children}
  </span>
);

export default Badge;
