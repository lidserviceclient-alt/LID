import { useEffect, useState } from 'react';
import { AUTH_TOKEN_CHANGED_EVENT, getAccessTokenPayload } from '@/services/auth';

export function useAuthPayload() {
  const [payload, setPayload] = useState(() => getAccessTokenPayload());

  useEffect(() => {
    const refreshPayload = () => setPayload(getAccessTokenPayload());
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, refreshPayload);
    window.addEventListener('storage', refreshPayload);
    window.addEventListener('focus', refreshPayload);
    return () => {
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, refreshPayload);
      window.removeEventListener('storage', refreshPayload);
      window.removeEventListener('focus', refreshPayload);
    };
  }, []);

  return payload;
}
