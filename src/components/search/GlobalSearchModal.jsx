import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, ArrowRight, Filter, Search } from "lucide-react";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";
import Label from "../ui/Label.jsx";
import { backofficeApi } from "../../services/api.js";
import { cn } from "../../utils/cn.js";
import { isRegexQuery, matchScore } from "../../utils/search.js";

const DEFAULT_TYPES = ["nav", "orders", "products", "customers", "users"];

const typeLabels = {
  nav: "Navigation",
  orders: "Commandes",
  products: "Produits",
  customers: "Clients",
  users: "Utilisateurs"
};

const typeBadges = {
  nav: { label: "NAV", variant: "outline" },
  orders: { label: "CMD", variant: "outline" },
  products: { label: "PROD", variant: "outline" },
  customers: { label: "CLIENT", variant: "outline" },
  users: { label: "USER", variant: "outline" }
};

const pageSize = 20;

const safeList = (value) => (Array.isArray(value) ? value : Array.isArray(value?.content) ? value.content : []);

const buildHaystack = (obj) => {
  if (!obj) return "";
  try {
    return JSON.stringify(obj);
  } catch {
    return `${obj}`;
  }
};

export default function GlobalSearchModal({ isOpen, onClose, shortcuts }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState(DEFAULT_TYPES);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [page, setPage] = useState(0);

  const [cacheLoading, setCacheLoading] = useState(false);
  const [cacheError, setCacheError] = useState("");
  const [cache, setCache] = useState({ products: [], customers: [], users: [] });

  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [orders, setOrders] = useState([]);

  const minCharsReached = useMemo(() => `${query}`.trim().length >= 3, [query]);
  const isRegex = useMemo(() => isRegexQuery(query), [query]);

  const toggleType = (t) => {
    setPage(0);
    setSelectedIndex(0);
    setActiveTypes((prev) => {
      const set = new Set(prev);
      if (set.has(t)) set.delete(t);
      else set.add(t);
      const next = Array.from(set);
      return next.length === 0 ? DEFAULT_TYPES : next;
    });
  };

  const closeAndNavigate = (to) => {
    onClose();
    if (to) navigate(to);
  };

  const ensureCache = async () => {
    if (cacheLoading) return;
    if (cache.products.length || cache.customers.length || cache.users.length) return;
    setCacheLoading(true);
    setCacheError("");
    try {
      const data = await backofficeApi.searchBootstrap({
        productsPage: 0,
        productsSize: 200,
        customersPage: 0,
        customersSize: 200,
        usersPage: 0,
        usersSize: 200
      });
      setCache({
        products: safeList(data?.products),
        customers: safeList(data?.customers),
        users: safeList(data?.users)
      });
    } catch (e) {
      setCacheError(e?.message || "Impossible de charger les données de recherche.");
    } finally {
      setCacheLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => inputRef.current?.focus?.(), 0);
    ensureCache();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const q = `${query || ""}`.trim();
    if (!q || !minCharsReached || !activeTypes.includes("orders")) {
      setOrders([]);
      setOrdersError("");
      setOrdersLoading(false);
      return;
    }

    let mounted = true;
    const t = setTimeout(async () => {
      if (!mounted) return;
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const res = await backofficeApi.orders(0, 50, "", q);
        if (!mounted) return;
        setOrders(safeList(res));
      } catch (e) {
        if (!mounted) return;
        setOrdersError(e?.message || "Recherche commandes indisponible.");
      } finally {
        if (!mounted) return;
        setOrdersLoading(false);
      }
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [activeTypes, isOpen, minCharsReached, query]);

  const navResults = useMemo(() => {
    if (!activeTypes.includes("nav")) return [];
    const q = `${query || ""}`.trim();
    if (!q) return shortcuts || [];
    return (shortcuts || []).filter((c) => {
      const hay = `${c.label} ${(c.keywords || []).join(" ")}`;
      return matchScore(q, hay) > 0;
    });
  }, [activeTypes, query, shortcuts]);

  const dataResults = useMemo(() => {
    const q = `${query || ""}`.trim();
    if (!q || !minCharsReached) return [];

    const results = [];

    if (activeTypes.includes("orders")) {
      for (const o of orders || []) {
        const hay = buildHaystack(o);
        const score = matchScore(q, hay);
        if (score > 0) {
          results.push({
            id: `order:${o.id}`,
            type: "orders",
            title: `Commande #${o.id}`,
            subtitle: `${o.customer || "-"} • ${o.status || "-"}`,
            to: "/orders",
            score
          });
        }
      }
    }

    if (activeTypes.includes("products")) {
      for (const p of cache.products || []) {
        const hay = buildHaystack(p);
        const score = matchScore(q, hay);
        if (score > 0) {
          results.push({
            id: `product:${p.id}`,
            type: "products",
            title: p.name || p.nom || `Produit ${p.id}`,
            subtitle: `${p.sku || "-"} • ${p.category || p.categoryId || "-"}`,
            to: "/products",
            score
          });
        }
      }
    }

    if (activeTypes.includes("customers")) {
      for (const c of cache.customers || []) {
        const hay = buildHaystack(c);
        const score = matchScore(q, hay);
        if (score > 0) {
          results.push({
            id: `customer:${c.id}`,
            type: "customers",
            title: c.name || `${c.prenom || ""} ${c.nom || ""}`.trim() || `Client ${c.id}`,
            subtitle: `${c.email || "-"} • ${c.role || "-"}`,
            to: "/customers",
            score
          });
        }
      }
    }

    if (activeTypes.includes("users")) {
      for (const u of cache.users || []) {
        const hay = buildHaystack(u);
        const score = matchScore(q, hay);
        if (score > 0) {
          results.push({
            id: `user:${u.id}`,
            type: "users",
            title: `${u.prenom || ""} ${u.nom || ""}`.trim() || u.email || `Utilisateur ${u.id}`,
            subtitle: `${u.email || "-"} • ${u.role || "-"}`,
            to: `/users/${u.id}`,
            score
          });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }, [activeTypes, cache.customers, cache.products, cache.users, minCharsReached, orders, query]);

  const mergedResults = useMemo(() => {
    const list = [];
    const q = `${query || ""}`.trim();
    if (activeTypes.includes("nav")) {
      for (const c of navResults) {
        const score = q ? matchScore(q, buildHaystack(c)) : 600;
        list.push({
          id: `nav:${c.label}`,
          type: "nav",
          title: c.label,
          subtitle: "Entrée",
          to: null,
          action: c.action,
          score
        });
      }
    }
    for (const r of dataResults) list.push(r);
    return list.sort((a, b) => b.score - a.score);
  }, [activeTypes, dataResults, navResults, query]);

  const paged = useMemo(() => {
    const start = page * pageSize;
    return mergedResults.slice(start, start + pageSize);
  }, [mergedResults, page]);

  useEffect(() => {
    setSelectedIndex(0);
    setPage(0);
  }, [activeTypes.join(","), query]);

  useEffect(() => {
    setSelectedIndex((idx) => Math.min(idx, Math.max(paged.length - 1, 0)));
  }, [paged.length]);

  const executeSelected = () => {
    const chosen = paged[selectedIndex] || paged[0];
    if (!chosen) return;
    if (chosen.action) {
      onClose();
      chosen.action();
      return;
    }
    if (chosen.to) {
      closeAndNavigate(chosen.to);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recherche" size="lg" className="max-w-3xl">
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="global-search">Requête</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="global-search"
                ref={inputRef}
                placeholder="Min 3 caractères. Regex: /pattern/i ou re:pattern"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex((idx) => Math.min(idx + 1, Math.max(paged.length - 1, 0)));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex((idx) => Math.max(idx - 1, 0));
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    executeSelected();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    onClose();
                  }
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {isRegex ? "Mode regex activé" : "Mode fuzzy activé"} • {minCharsReached ? "Recherche détaillée active" : "Tape au moins 3 caractères"}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Filtres</Label>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Filter className="h-4 w-4" />
                Types
              </div>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_TYPES.map((t) => {
                  const active = activeTypes.includes(t);
                  return (
                    <button
                      key={t}
                      className={cn(
                        "px-2 py-1 rounded-full text-xs border transition-colors",
                        active
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-background border-border/60 text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => toggleType(t)}
                      type="button"
                    >
                      {typeLabels[t]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {(cacheError || ordersError) && (
          <div className="rounded-lg bg-destructive/10 p-3 text-destructive border border-destructive/20 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {cacheError || ordersError}
            </div>
          </div>
        )}

        <div className="border rounded-xl overflow-hidden">
          {cacheLoading || ordersLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Chargement…</div>
          ) : mergedResults.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Aucun résultat.</div>
          ) : (
            <div className="max-h-[55vh] overflow-y-auto">
              {paged.map((r, idx) => {
                const badge = typeBadges[r.type] || { label: r.type, variant: "outline" };
                return (
                  <button
                    key={r.id}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm flex items-start gap-3 hover:bg-muted transition-colors",
                      idx === selectedIndex ? "bg-muted" : ""
                    )}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      if (r.action) {
                        onClose();
                        r.action();
                        return;
                      }
                      if (r.to) closeAndNavigate(r.to);
                    }}
                    type="button"
                  >
                    <div className="pt-0.5">
                      <Badge label={badge.label} variant={badge.variant} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{r.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.subtitle}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.score}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {mergedResults.length} résultat(s) • Page {page + 1} / {Math.max(1, Math.ceil(mergedResults.length / pageSize))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={(page + 1) * pageSize >= mergedResults.length}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
