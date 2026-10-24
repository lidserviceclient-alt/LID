import { createContext, useContext } from "react";

const PartnerBackofficeBootstrapContext = createContext(null);

export function PartnerBackofficeBootstrapProvider({ value, children }) {
  return (
    <PartnerBackofficeBootstrapContext.Provider value={value}>
      {children}
    </PartnerBackofficeBootstrapContext.Provider>
  );
}

export function usePartnerBackofficeBootstrap() {
  return useContext(PartnerBackofficeBootstrapContext);
}
