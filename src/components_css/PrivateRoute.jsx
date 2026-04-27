import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  // Dacă nu există user, dă-l afară spre pagina de auth
  return currentUser ? children : <Navigate to="/auth" />;
}

export default PrivateRoute;