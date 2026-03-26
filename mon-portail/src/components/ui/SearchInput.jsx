import React from 'react';
import { Search } from 'lucide-react';
import './SearchInput.css';

/**
 * Combo search-icon + input.
 * @param {string} value
 * @param {function} onChange
 * @param {string} placeholder
 * @param {'sm'|'md'} size
 * @param {string} className
 */
const SearchInput = ({ value, onChange, placeholder = 'Rechercher...', size = 'md', className = '' }) => (
  <div className={`ui-search-input ui-search-input--${size} ${className}`}>
    <Search className="ui-search-input__icon" size={size === 'sm' ? 12 : 16} />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="ui-search-input__field"
    />
  </div>
);

export default SearchInput;
