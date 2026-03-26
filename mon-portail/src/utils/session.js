/**
 * Generates a unique session ID (hex string prefixed with 'A').
 * @returns {string} A 32-character session identifier.
 */
export const generateSessionId = () => {
  return (
    'A' +
    Array.from({ length: 31 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('')
  );
};
