import { Link } from "react-router-dom";
import { Loader2, LogIn, PackageSearch, RefreshCw, Search, WifiOff } from "lucide-react";
import { cn } from "@/utils/cn";

/** Formulaire de recherche : le suivi est reserve au titulaire connecte, le numero de commande suffit. */
export function TrackingSearchForm({ value, onChange, onSubmit, loading, compact = false }) {
  return (
    <form onSubmit={onSubmit} role="search" className={cn("w-full", compact ? "max-w-md" : "max-w-lg")}>
      <label htmlFor="tracking-order-number" className={compact ? "sr-only" : "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"}>
        Numéro de commande
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            id="tracking-order-number"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="Ex. ORD-9XK3-7P2L"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 font-medium uppercase text-neutral-900 outline-none transition placeholder:normal-case placeholder:font-normal placeholder:text-neutral-400 focus:border-[#6aa200] focus:ring-4 focus:ring-[#6aa200]/15 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white",
              compact ? "h-10 text-sm" : "h-12 text-base"
            )}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#6aa200] px-4 font-semibold text-white transition hover:bg-[#5a8a00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6aa200]/30 disabled:opacity-60",
            compact ? "h-10 text-sm" : "h-12 text-base sm:px-6"
          )}
        >
          {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null}
          Suivre
        </button>
      </div>
      {!compact && (
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          Vous le trouverez dans l'e-mail de confirmation ou dans <Link to="/profile?tab=orders" className="font-medium text-[#4f7d00] underline-offset-2 hover:underline dark:text-[#9fd63a]">Mes commandes</Link>.
        </p>
      )}
    </form>
  );
}

export function TrackingSkeleton() {
  const bar = "animate-pulse rounded-lg bg-neutral-200/80 dark:bg-neutral-800";
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-4">
      <span className="sr-only">Chargement du suivi…</span>
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7 dark:border-neutral-800 dark:bg-neutral-900">
        <div className={cn(bar, "h-3 w-40")} />
        <div className={cn(bar, "mt-4 h-8 w-64 max-w-full")} />
        <div className={cn(bar, "mt-3 h-4 w-80 max-w-full")} />
        <div className="mt-8 grid gap-4 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className={cn(bar, "h-10")} />)}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className={cn(bar, "h-56 rounded-2xl lg:col-span-2")} />
        <div className={cn(bar, "h-56 rounded-2xl")} />
      </div>
    </div>
  );
}

const STATE_CONTENT = {
  auth: {
    icon: LogIn,
    title: "Connectez-vous pour suivre votre commande",
    text: "Pour protéger vos informations, le suivi détaillé est réservé au titulaire de la commande.",
  },
  notFound: {
    icon: PackageSearch,
    title: "Commande introuvable",
    text: "Nous ne trouvons pas cette commande dans votre compte. Vérifiez le numéro (format ORD-XXXX-XXXX) ou consultez vos commandes.",
  },
  network: {
    icon: WifiOff,
    title: "Suivi momentanément indisponible",
    text: "Nous n'avons pas pu joindre nos serveurs. Vérifiez votre connexion puis réessayez.",
  },
};

export function TrackingErrorState({ kind, onRetry }) {
  const content = STATE_CONTENT[kind] || STATE_CONTENT.network;
  const Icon = content.icon;
  return (
    <div role="alert" className="rounded-2xl border border-neutral-200 bg-white p-6 text-center sm:p-10 dark:border-neutral-800 dark:bg-neutral-900">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
        <Icon size={22} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-neutral-900 dark:text-white">{content.title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">{content.text}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {kind === "auth" && (
          <Link to="/login" className="inline-flex h-10 items-center rounded-xl bg-[#6aa200] px-5 text-sm font-semibold text-white hover:bg-[#5a8a00]">
            Me connecter
          </Link>
        )}
        {kind === "network" && onRetry && (
          <button type="button" onClick={onRetry} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#6aa200] px-5 text-sm font-semibold text-white hover:bg-[#5a8a00]">
            <RefreshCw size={16} aria-hidden="true" /> Réessayer
          </button>
        )}
        {kind === "notFound" && (
          <Link to="/profile?tab=orders" className="inline-flex h-10 items-center rounded-xl bg-[#6aa200] px-5 text-sm font-semibold text-white hover:bg-[#5a8a00]">
            Voir mes commandes
          </Link>
        )}
        <Link to="/contact" className="inline-flex h-10 items-center rounded-xl border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
          Contacter le service client
        </Link>
      </div>
    </div>
  );
}
