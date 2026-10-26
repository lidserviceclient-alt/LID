import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const settingsResolverStore = createResolverStore(async () => backofficeApi.settingsCollection(), () => "settings");

export function useSettingsResolver() {
  return settingsResolverStore.useResolver();
}

export async function reloadSettingsResolver() {
  return settingsResolverStore.load([], { force: true });
}

/**
 * Remplace une ou plusieurs parties de la collection de paramètres en cache
 * (ex. { socialLinks: [...] }) après un rechargement ciblé, pour que les
 * sous-pages de /settings restent cohérentes sans recharger toute la collection.
 */
export function patchSettingsResolver(partial) {
  settingsResolverStore.update([], (data) => ({ ...data, ...partial }));
}
