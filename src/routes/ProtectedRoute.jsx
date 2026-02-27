import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loader from '@/components/Loader';
import { isAuthenticated, refreshSession } from '@/services/authService';

/**
 * Composant de protection de route.
 * Vérifie si l'utilisateur est connecté avant d'afficher le contenu.
 * Sinon, redirige vers la page de connexion.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [state, setState] = useState({ checking: true, allowed: false });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (isAuthenticated()) {
        if (!cancelled) setState({ checking: false, allowed: true });
        return;
      }
      const ok = await refreshSession();
      if (!cancelled) setState({ checking: false, allowed: ok });
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.checking) {
    return <Loader />;
  }

  if (!state.allowed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
