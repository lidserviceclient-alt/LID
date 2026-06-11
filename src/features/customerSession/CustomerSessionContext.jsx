import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyCustomerProfileCollection } from "@/services/customerService";
import { CUSTOMER_SESSION_CLEARED_EVENT } from "@/services/sessionCleanup";
import { subscribeFrontendRealtime } from "@/services/realtimeService";
import { useAuthPayload } from "@/hooks/useAuthPayload";

const CustomerSessionContext = createContext(null);

export function CustomerSessionProvider({ children }) {
  const queryClient = useQueryClient();
  const tokenPayload = useAuthPayload();
  const canLoadCustomerSession = Boolean(tokenPayload?.sub);
  const customerSessionQueryKey = useMemo(
    () => ["customer-session-collection", tokenPayload?.sub || null],
    [tokenPayload?.sub]
  );
  const refetchRef = useRef(null);

  const query = useQuery({
    queryKey: customerSessionQueryKey,
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
    queryClient.setQueryData(customerSessionQueryKey, (prev) => {
      if (typeof updater === "function") {
        return updater(prev || null);
      }
      return updater;
    });
  };

  useEffect(() => {
    const clearCustomerQueryCache = () => {
      queryClient.removeQueries({ queryKey: ["customer-session-collection"], exact: false });
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
      queryClient.invalidateQueries({ queryKey: customerSessionQueryKey, exact: true });
      refetchRef.current?.();
    }, ["payment.status.updated"]);
  }, [canLoadCustomerSession, customerSessionQueryKey, queryClient]);

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
