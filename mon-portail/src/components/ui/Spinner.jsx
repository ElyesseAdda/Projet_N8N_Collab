import React from 'react';
import './Spinner.css';

/**
 * Unified spinner component.
 * @param {'sm'|'md'|'lg'} size - sm=14px, md=20px, lg=24px (default: md)
 * @param {string} className - Additional CSS classes
 */
const Spinner = ({ size = 'md', className = '' }) => (
  <span className={`ui-spinner ui-spinner--${size} ${className}`} />
);

export default Spinner;
