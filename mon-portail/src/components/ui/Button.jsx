import React from 'react';
import Spinner from './Spinner';
import './Button.css';

/**
 * Unified button component.
 * @param {'primary'|'ghost'|'icon'} variant
 * @param {'sm'|'md'} size
 * @param {boolean} loading - Show spinner instead of children
 * @param {React.ReactNode} icon - Optional leading icon
 * @param {string} className - Additional CSS classes
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={`ui-btn ui-btn--${variant} ui-btn--${size} ${className}`}
    {...rest}
  >
    {loading ? (
      <Spinner size={size === 'sm' ? 'sm' : 'sm'} />
    ) : icon ? (
      <span className="ui-btn__icon">{icon}</span>
    ) : null}
    {children && <span className="ui-btn__label">{children}</span>}
  </button>
);

export default Button;
