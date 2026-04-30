import PageSEO from "@/components/PageSEO";
import { useAppConfig } from "@/features/appConfig/useAppConfig.js";

export default function NotFound() {
  const { data: appConfig } = useAppConfig();
  const contactEmail = appConfig?.contactEmail || "voir page contact.";
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900">
      <PageSEO title="Page introuvable" noindex />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#6aa200]/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-6 h-56 w-56 rounded-full bg-[#FF9900]/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src="/imgs/lid-green.png" className="h-26 w-20" alt="" />
            </div>
            <h1 className="text-4xl font-black leading-tight text-neutral-900 dark:text-white sm:text-5xl">
              Oups, cette page n’existe pas.
            </h1>
            <p className="max-w-xl text-base text-neutral-600 dark:text-neutral-300 sm:text-lg">
              La page que tu cherches a été déplacée ou supprimée. Découvre nos catégories ou retourne à l’accueil.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-[#6aa200] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6aa200]/30 transition hover:brightness-110"
              >
                Retour à l’accueil
              </a>
              <a
                href="/shop"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
              >
                Voir le catalogue
              </a>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 dark:border-neutral-700 dark:bg-neutral-900">Mode rapide</span>
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 dark:border-neutral-700 dark:bg-neutral-900">Paiement sécurisé</span>
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 dark:border-neutral-700 dark:bg-neutral-900">Livraison fiable</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-2xl shadow-neutral-200/60 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70 dark:shadow-black/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400">Code erreur</span>
                <span className="text-xs font-semibold text-[#6aa200]">LID / 404</span>
              </div>
              <div className="mt-6 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-6 text-white">
                <div className="text-6xl font-black tracking-tight">404</div>
                <div className="mt-2 text-sm text-white/70">Impossible de trouver la page demandée.</div>
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-white/70">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <div className="text-[10px] uppercase text-white/50">Statut</div>
                    <div className="mt-1 font-semibold text-white">Introuvable</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <div className="text-[10px] uppercase text-white/50">Support</div>
                    <a href={`mailto:${contactEmail}`} className="mt-1 font-semibold text-white inline-flex">
                      {contactEmail}
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3 text-sm text-neutral-500 dark:text-neutral-300">
                <div className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 dark:border-neutral-800">
                  <span>Catégories tendances</span>
                  <a href="/shop" className="font-semibold text-[#6aa200]">Explorer</a>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 dark:border-neutral-800">
                  <span>Besoin d’aide ?</span>
                  <a href="/contact" className="font-semibold text-[#6aa200]">Nous contacter</a>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-[#6aa200]/20 blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
