import { useSyncExternalStore } from "react";
import { getMenuVariant, subscribeMenuVariant } from "@/features/catalog/menuVariantStore";

/** Live-subscribes to the shared menu design variant (see MenuVariantSwitcher). */
export function useMenuVariant() {
  return useSyncExternalStore(subscribeMenuVariant, getMenuVariant, getMenuVariant);
}
