import React from 'react';
import './Input.css';

/**
 * Unified input / textarea component.
 * @param {'text'|'textarea'} as - Render as input or textarea
 * @param {'sm'|'md'} size
 * @param {string} className - Additional CSS classes
 */
const Input = React.forwardRef(
  ({ as = 'text', size = 'md', className = '', ...rest }, ref) => {
    const cls = `ui-input ui-input--${size} ${className}`;
    if (as === 'textarea') {
      return <textarea ref={ref} className={cls} {...rest} />;
    }
    return <input ref={ref} type="text" className={cls} {...rest} />;
  },
);

Input.displayName = 'Input';
export default Input;
