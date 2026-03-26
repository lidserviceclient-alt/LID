import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loader from '@/components/Loader';
import { getCurrentUserPayload, getUserProfile, isAuthenticated, refreshSession } from '@/services/authService';

/**
 * Composant de protection de route.
 * Vérifie si l'utilisateur est connecté avant d'afficher le contenu.
 * Sinon, redirige vers la page de connexion.
 */
const normalizeRole = (r) => `${r || ''}`.replace(/^ROLE_/, '').trim().toUpperCase();

const hasAnyRole = (payload, requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  const userRoles = (payload?.roles || []).map(normalizeRole);
  const required = requiredRoles.map(normalizeRole);
  return required.some((rr) => userRoles.includes(rr));
};

const ProtectedRoute = ({
  children,
  requiredRoles,
  forbiddenTo = '/seller-joint',
  requireVerifiedPartner = false,
  unverifiedPartnerRedirectTo = '/seller-join'
}) => {
  const location = useLocation();
  const [state, setState] = useState({
    checking: true,
    allowed: false,
    roleOk: true,
    verifiedPartnerOk: true
  });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const ensureAuth = async () => {
        if (isAuthenticated()) return true;
        return await refreshSession();
      };

      const ok = await ensureAuth();
      if (!ok) {
        if (!cancelled) setState({ checking: false, allowed: false, roleOk: true });
        return;
      }

      const payload = getCurrentUserPayload();
      const roleOk = hasAnyRole(payload, requiredRoles);
      let verifiedPartnerOk = true;

      if (roleOk && requireVerifiedPartner) {
        try {
          const profile = await getUserProfile(payload?.sub);
          verifiedPartnerOk = `${profile?.registrationStatus || ''}`.trim().toUpperCase() === 'VERIFIED';
        } catch (_error) {
          verifiedPartnerOk = false;
        }
      }

      if (!cancelled) {
        setState({ checking: false, allowed: true, roleOk, verifiedPartnerOk });
      }
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

  if (!state.roleOk) {
    return <Navigate to={forbiddenTo} replace />;
  }

  if (!state.verifiedPartnerOk) {
    return <Navigate to={unverifiedPartnerRedirectTo} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
