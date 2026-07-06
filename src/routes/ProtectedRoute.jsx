 import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/auth" replace />;
  if (!currentUser.emailVerified) return <Navigate to="/verifica-email" replace />;

  return children;
}

export default ProtectedRoute;