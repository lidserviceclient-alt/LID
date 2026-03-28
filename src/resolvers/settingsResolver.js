import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const settingsResolverStore = createResolverStore(async () => backofficeApi.settingsCollection(), () => "settings");

export function useSettingsResolver() {
  return settingsResolverStore.useResolver();
}

export async function reloadSettingsResolver() {
  return settingsResolverStore.load([], { force: true });
}
