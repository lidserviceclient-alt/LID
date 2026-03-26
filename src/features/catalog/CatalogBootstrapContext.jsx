import { createContext, useContext } from "react";

const CatalogBootstrapContext = createContext(null);

export function CatalogBootstrapProvider({ value, children }) {
  return <CatalogBootstrapContext.Provider value={value}>{children}</CatalogBootstrapContext.Provider>;
}

export function useCatalogBootstrap() {
  return useContext(CatalogBootstrapContext);
}
