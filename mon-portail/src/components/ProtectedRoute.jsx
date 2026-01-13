import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Non authentifié, redirection vers /connect');
    return <Navigate to="/connect" replace />;
  }
  console.log('ProtectedRoute: Authentifié, affichage du contenu');
  return children;
}

export default ProtectedRoute;

