import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserPayload } from "@/services/authService";
import { getMyCustomerProfileCollection } from "@/services/customerService";
import { CUSTOMER_SESSION_CLEARED_EVENT } from "@/services/sessionCleanup";
import { subscribeFrontendRealtime } from "@/services/realtimeService";

const CustomerSessionContext = createContext(null);

export function CustomerSessionProvider({ children }) {
  const queryClient = useQueryClient();
  const tokenPayload = getCurrentUserPayload();
  const canLoadCustomerSession = Boolean(tokenPayload?.sub);
  const refetchRef = useRef(null);

  const query = useQuery({
    queryKey: ["customer-session-collection"],
    queryFn: () => getMyCustomerProfileCollection(0, 100),
    enabled: canLoadCustomerSession,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    retry: 1,
  });

  useEffect(() => {
    refetchRef.current = query.refetch;
  }, [query.refetch]);

  const updateCustomerCollection = (updater) => {
    queryClient.setQueryData(["customer-session-collection"], (prev) => {
      if (typeof updater === "function") {
        return updater(prev || null);
      }
      return updater;
    });
  };

  useEffect(() => {
    const clearCustomerQueryCache = () => {
      queryClient.removeQueries({ queryKey: ["customer-session-collection"], exact: true });
    };
    window.addEventListener(CUSTOMER_SESSION_CLEARED_EVENT, clearCustomerQueryCache);
    return () => window.removeEventListener(CUSTOMER_SESSION_CLEARED_EVENT, clearCustomerQueryCache);
  }, [queryClient]);

  useEffect(() => {
    if (!canLoadCustomerSession) {
      return undefined;
    }

    return subscribeFrontendRealtime((event) => {
      if (event?.topic !== "payment.status.updated") {
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["customer-session-collection"], exact: true });
      refetchRef.current?.();
    }, ["payment.status.updated"]);
  }, [canLoadCustomerSession, queryClient]);

  const value = useMemo(() => {
    const collection = query.data || null;
    return {
      tokenPayload,
      canLoadCustomerSession,
      customerCollection: collection,
      customer: collection?.customer || null,
      orders: Array.isArray(collection?.orders) ? collection.orders : [],
      wishlist: Array.isArray(collection?.wishlist) ? collection.wishlist : [],
      addresses: Array.isArray(collection?.addresses) ? collection.addresses : [],
      isLoading: canLoadCustomerSession ? query.isLoading : false,
      isResolved: canLoadCustomerSession ? Boolean(query.isFetched || query.error) : true,
      error: query.error || null,
      refetch: query.refetch,
      updateCustomerCollection,
    };
  }, [canLoadCustomerSession, query.data, query.error, query.isFetched, query.isLoading, query.refetch, tokenPayload]);

  return <CustomerSessionContext.Provider value={value}>{children}</CustomerSessionContext.Provider>;
}

export function useCustomerSession() {
  return useContext(CustomerSessionContext);
}
