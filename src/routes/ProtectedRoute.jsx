import { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Loader from '@/components/Loader';
import { getCachedUserProfile, getCurrentUserPayload, isAuthenticated, refreshSession } from '@/services/authService';

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
  const authQuery = useQuery({
    queryKey: ['protected-route-auth', (requiredRoles || []).join(','), requireVerifiedPartner],
    queryFn: async () => {
      const allowed = isAuthenticated() ? true : await refreshSession();
      if (!allowed) {
        return {
          allowed: false,
          roleOk: true,
          verifiedPartnerOk: true,
          payload: null,
        };
      }

      const payload = getCurrentUserPayload();
      const roleOk = hasAnyRole(payload, requiredRoles);
      let verifiedPartnerOk = true;

      if (roleOk && requireVerifiedPartner) {
        try {
          const profile = await getCachedUserProfile(payload?.sub);
          verifiedPartnerOk = `${profile?.registrationStatus || ''}`.trim().toUpperCase() === 'VERIFIED';
        } catch (_error) {
          verifiedPartnerOk = false;
        }
      }

      return { allowed: true, roleOk, verifiedPartnerOk, payload };
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const state = useMemo(() => authQuery.data || {
    checking: true,
    allowed: false,
    roleOk: true,
    verifiedPartnerOk: true,
  }, [authQuery.data]);

  if (authQuery.isLoading) {
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
