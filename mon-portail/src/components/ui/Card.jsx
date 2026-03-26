import React from 'react';
import './Card.css';

/**
 * Glassmorphism card wrapper.
 * @param {'default'|'interactive'} variant
 * @param {boolean} selected
 * @param {string} className
 */
const Card = ({ variant = 'default', selected = false, children, className = '', ...rest }) => (
  <div
    className={`ui-card ui-card--${variant} ${selected ? 'ui-card--selected' : ''} ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
