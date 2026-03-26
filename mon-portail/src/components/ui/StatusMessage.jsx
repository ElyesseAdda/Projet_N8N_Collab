import React from 'react';
import Spinner from './Spinner';
import './StatusMessage.css';

/**
 * Loading / error / empty state component.
 * @param {'loading'|'error'|'empty'} type
 * @param {string} message
 * @param {React.ReactNode} children - Optional extra content
 */
const StatusMessage = ({ type = 'loading', message, children }) => (
  <div className={`ui-status ui-status--${type}`} role={type === 'error' ? 'alert' : 'status'}>
    {type === 'loading' && <Spinner size="md" />}
    {message && <span className="ui-status__text">{message}</span>}
    {children}
  </div>
);

export default StatusMessage;
