import { useEffect, useState } from "react";
import { resolveBackendAssetUrl } from "@/services/categoryService";

// Utilitaires partagés par la fiche produit réelle (/product/:id) et ses composants « Live ».

export const FALLBACK_IMAGE = "/imgs/logo.png";

/** Anneau de focus clavier commun (accessibilité). */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pdp-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950";

const moneyFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export const formatFcfa = (value) => `${moneyFormatter.format(Math.round(Number(value) || 0))} FCFA`;

export const resolveImageSrc = (url) => {
  const raw = `${url || ""}`.trim();
  if (!raw) return "";
  if (raw.startsWith("/imgs/")) return raw;
  return resolveBackendAssetUrl(raw);
};

/** Image principale brute (non résolue) d'un produit catalogue ou détail. */
export const pickMainImage = (product) =>
  product?.mainImageUrl ||
  product?.imageUrl ||
  (Array.isArray(product?.images) ? product.images[0] : "") ||
  (Array.isArray(product?.secondaryImageUrls) ? product.secondaryImageUrls[0] : "") ||
  "";

/** Liste dédupliquée des images résolues (principale d'abord). Vide si le produit n'a aucune image. */
export const pickGalleryImages = (product) => {
  const urls = [];
  const add = (url) => {
    const resolved = resolveImageSrc(url);
    if (resolved && !urls.includes(resolved)) urls.push(resolved);
  };
  add(product?.mainImageUrl);
  add(product?.imageUrl);
  (Array.isArray(product?.images) ? product.images : []).forEach(add);
  (Array.isArray(product?.secondaryImageUrls) ? product.secondaryImageUrls : []).forEach(add);
  return urls;
};

/** Délai d'un mode de livraison (back-office : leadTimeMin/Max/Unit), repli sur sa description. */
export const formatShippingLeadTime = (method) => {
  const unit = `${method?.leadTimeUnit || ""}`.toUpperCase();
  const min = Number(method?.leadTimeMin);
  const max = Number(method?.leadTimeMax);
  if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min) {
    if (unit === "HOURS") return min === max ? `${min} h` : `${min} à ${max} h`;
    return min === max ? `${min} jour${min > 1 ? "s" : ""} ouvrable${min > 1 ? "s" : ""}` : `${min} à ${max} jours ouvrables`;
  }
  return `${method?.description || ""}`.trim();
};

/** Remise affichée uniquement si l'API renvoie un prix initial strictement supérieur au prix de vente. */
export const computeDiscount = (price, initialPrice) => {
  const p = Number(price);
  const initial = Number(initialPrice);
  if (!Number.isFinite(p) || !Number.isFinite(initial) || p <= 0 || initial <= p) return null;
  const percent = Math.round(((initial - p) / initial) * 100);
  return percent >= 1 ? { initialPrice: initial, percent } : null;
};

export const LOW_STOCK_THRESHOLD = 5;

/** État de disponibilité selon `stock` (null si l'API ne renvoie pas de stock). */
export const getAvailability = (stock) => {
  const n = Number(stock);
  if (stock === null || stock === undefined || !Number.isFinite(n)) return { status: "unknown", stock: null };
  if (n <= 0) return { status: "out", stock: 0 };
  if (n <= LOW_STOCK_THRESHOLD) return { status: "low", stock: n };
  return { status: "in", stock: n };
};

/**
 * Découpe une description texte en blocs lisibles : paragraphes (séparés par une ligne vide)
 * et listes (lignes commençant par -, *, • ou « 1. »).
 */
export const parseDescription = (text) => {
  const raw = `${text || ""}`.replace(/\r\n?/g, "\n").trim();
  if (!raw) return [];
  const blocks = [];
  const bulletRe = /^\s*(?:[-*•–]|\d+[.)])\s+/;
  for (const chunk of raw.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    let paragraph = [];
    let list = null;
    const flushParagraph = () => {
      if (paragraph.length) blocks.push({ type: "p", lines: paragraph });
      paragraph = [];
    };
    const flushList = () => {
      if (list?.length) blocks.push({ type: "ul", items: list });
      list = null;
    };
    for (const line of lines) {
      if (bulletRe.test(line)) {
        flushParagraph();
        list = list || [];
        list.push(line.replace(bulletRe, ""));
      } else {
        flushList();
        paragraph.push(line);
      }
    }
    flushParagraph();
    flushList();
  }
  return blocks;
};

/**
 * Mesure l'en-tête du site (collant) et la barre de navigation mobile (fixe en bas) pour positionner
 * les éléments collants de la fiche sans valeurs magiques.
 */
export function useSiteChromeOffsets() {
  const [offsets, setOffsets] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return undefined;
    const header = document.querySelector("header");
    const bottomNav = header?.nextElementSibling || null;
    const floatingTop = header?.querySelector(".fixed.top-0") || null;

    const isShown = (el) => el && window.getComputedStyle(el).display !== "none";
    const measure = () => {
      let top = 0;
      if (header && window.getComputedStyle(header).position === "sticky") {
        top = header.getBoundingClientRect().height;
      }
      if (isShown(floatingTop) && window.getComputedStyle(floatingTop).position === "fixed") {
        top = Math.max(top, floatingTop.getBoundingClientRect().bottom);
      }
      let bottom = 0;
      if (isShown(bottomNav) && window.getComputedStyle(bottomNav).position === "fixed") {
        bottom = bottomNav.getBoundingClientRect().height;
      }
      const next = { top: Math.round(top), bottom: Math.round(bottom) };
      setOffsets((prev) => (prev.top === next.top && prev.bottom === next.bottom ? prev : next));
    };

    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    [header, bottomNav, floatingTop].forEach((el) => el && ro?.observe(el));
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return offsets;
}

/** Défilement doux vers une ancre en tenant compte de l'en-tête collant. */
export const scrollToId = (id, offset = 0) => {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
};
