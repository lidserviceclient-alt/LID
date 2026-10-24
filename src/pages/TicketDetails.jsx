import { useEffect, useMemo, useState } from "react";
import PageSEO from "@/components/PageSEO";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Ticket as TicketIcon, ArrowLeft, Zap, ShieldCheck, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { getTicketEvent } from "@/services/ticketService";
import { useCart } from "@/features/cart/CartContext";

const formatDateTime = (value) => {
  if (!value) return "-";
  const s = `${value}`.trim();
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("fr-FR");
};

const formatPrice = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return `${num.toLocaleString("fr-FR")} FCFA`;
};

const getTheme = (category) => {
  switch (category) {
    case "Concert":
      return { gradient: "from-[#ff007f]/90 to-[#ff007f]/30", accent: "text-[#ff007f]" };
    case "Gala":
      return { gradient: "from-[#FFD700]/90 to-[#FFD700]/30", accent: "text-[#b38a00]" };
    case "Sport":
      return { gradient: "from-[#0055ff]/90 to-[#0055ff]/30", accent: "text-[#0055ff]" };
    case "Conférence":
      return { gradient: "from-[#1e293b]/90 to-[#1e293b]/30", accent: "text-[#1e293b]" };
    case "Art":
      return { gradient: "from-[#ff7f50]/90 to-[#ff7f50]/30", accent: "text-[#ff7f50]" };
    default:
      return { gradient: "from-black/90 to-black/30", accent: "text-black" };
  }
};

export default function TicketDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const theme = useMemo(() => getTheme(ticket?.category), [ticket?.category]);

  useEffect(() => {
    const ticketId = `${id || ""}`.trim();
    if (!ticketId) {
      setError("Identifiant de billet manquant.");
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError("");

    getTicketEvent(ticketId)
      .then((data) => {
        if (cancelled) return;
        setTicket(data);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.message || "Impossible de charger le billet.";
        setError(message);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setSelectedQuantity((prev) => Math.max(1, Math.min(prev, Math.max(1, Number(ticket?.quantityAvailable) || 1))));
  }, [ticket?.quantityAvailable]);

  const handleAddToCart = () => {
    if (!ticket) return;
    if (!ticket?.sellable) {
      toast.error("Événement indisponible");
      return;
    }
    const priceNumber = Number(ticket?.price);
    const hasPrice = Number.isFinite(priceNumber);
    addToCart({
      ...ticket,
      price: hasPrice ? priceNumber : 0,
      type: "ticket",
      name: ticket.title,
      brand: "LID Events",
      quantity: selectedQuantity,
    });
    toast.success("Ajouté au panier");
  };

  const maxQuantity = Math.max(1, Number(ticket?.quantityAvailable) || 1);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
      <PageSEO
        title={ticket?.title}
        description={ticket?.title ? `Réservez vos billets pour "${ticket.title}" sur Lid Billetterie.` : undefined}
        canonical={ticket?.id ? `/tickets/${ticket.id}` : undefined}
        type="event"
      />
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link
            to="/tickets"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la billetterie
          </Link>
        </div>

        {isLoading && (
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30 p-8">
            Chargement…
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-3xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-6">
            <p className="font-bold mb-1">Erreur</p>
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {!isLoading && !error && ticket && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800">
                <div className="absolute inset-0">
                  <img
                    src={ticket.image}
                    alt={ticket.title}
                    width="800"
                    height="500"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/imgs/wall-1.jpg";
                    }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${theme.gradient}`} />
                  <div className="absolute inset-0 bg-black/10 dark:bg-black/25" />
                </div>

                <div className="relative p-6 md:p-10 min-h-[320px] flex flex-col justify-end">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 text-black text-xs font-bold">
                      <TicketIcon className="w-4 h-4" />
                      {ticket.category || "Événement"}
                    </span>
                    {!ticket.sellable && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-bold">
                        Indisponible
                      </span>
                    )}
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/15">
                      <ShieldCheck className="w-4 h-4" />
                      Vérifié par LID
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05] text-white drop-shadow">
                    {ticket.title}
                  </h1>

                  <div className="mt-5 flex flex-wrap gap-3 text-white/95">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">{formatDateTime(ticket.date)}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-semibold">{ticket.location || "Lieu à confirmer"}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15">
                      <span className="text-sm font-semibold">{formatPrice(ticket.price)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 p-6 md:p-8">
                <h2 className="text-xl font-black mb-3">Description</h2>
                <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {ticket.description || "Aucune description fournie."}
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 p-6 md:p-8">
                <p className={`text-xs font-bold uppercase tracking-[0.25em] ${theme.accent}`}>Billet</p>
                <p className="mt-2 text-3xl font-black">{formatPrice(ticket.price)}</p>

                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">Quantité</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 dark:border-neutral-800"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="min-w-[72px] rounded-2xl border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-center text-lg font-black">
                      {selectedQuantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedQuantity((prev) => Math.min(maxQuantity, prev + 1))}
                      disabled={selectedQuantity >= maxQuantity}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 dark:border-neutral-800 disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!ticket.sellable}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-5 h-5" />
                  Ajouter au panier
                </button>

                <div className="mt-6 grid gap-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 px-4 py-3">
                    <span className="text-neutral-600 dark:text-neutral-300">Catégorie</span>
                    <span className="font-bold">{ticket.category || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 px-4 py-3">
                    <span className="text-neutral-600 dark:text-neutral-300">Disponibilité</span>
                    <span className="font-bold">{ticket.sellable ? "En vente" : ticket.available === false ? "Désactivé" : "Rupture"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 px-4 py-3">
                    <span className="text-neutral-600 dark:text-neutral-300">Référence</span>
                    <span className="font-mono text-xs">{ticket.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
