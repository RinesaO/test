import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false, pharmacyOnly = false, ministryOnly = false }) => {
  const { isAuthenticated, isAdmin, isPharmacy, isMinistry, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (pharmacyOnly && !isPharmacy) {
    return <Navigate to="/dashboard" replace />;
  }

  if (ministryOnly && !isMinistry) {
    return <Navigate to="/ministry/login" replace />;
  }

  return children;
};

export default PrivateRoute;

