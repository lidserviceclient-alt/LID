import { createContext, useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserPayload } from "@/services/authService";
import { getMyCustomerProfileCollection } from "@/services/customerService";

const CustomerSessionContext = createContext(null);

const normalizeRole = (role) => `${role || ""}`.replace(/^ROLE_/, "").trim().toUpperCase();

export function CustomerSessionProvider({ children }) {
  const queryClient = useQueryClient();
  const tokenPayload = getCurrentUserPayload();
  const roles = Array.isArray(tokenPayload?.roles) ? tokenPayload.roles.map(normalizeRole) : [];
  const hasPartnerRole = roles.includes("PARTNER");
  const canLoadCustomerSession = Boolean(tokenPayload?.sub) && !hasPartnerRole;

  const query = useQuery({
    queryKey: ["customer-session-collection"],
    queryFn: () => getMyCustomerProfileCollection(0, 100),
    enabled: canLoadCustomerSession,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    retry: 1,
  });

  const updateCustomerCollection = (updater) => {
    queryClient.setQueryData(["customer-session-collection"], (prev) => {
      if (typeof updater === "function") {
        return updater(prev || null);
      }
      return updater;
    });
  };

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
