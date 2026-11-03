// Instance Lenis partagée : un window.scrollTo natif ne remet pas à zéro l'état interne
// (position animée / cible) de Lenis, qui peut ensuite ramener la page à l'ancienne position.
let lenisInstance = null;

export function registerLenis(instance) {
  lenisInstance = instance;
}

export function scrollToTopNow() {
  if (typeof window === "undefined") return;
  try {
    lenisInstance?.scrollTo(0, { immediate: true, force: true });
  } catch {
    /* ignore */
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
