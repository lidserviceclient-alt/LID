import { useEffect, useMemo, useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Modal from "../ui/Modal.jsx";
import { backofficeApi } from "../../services/api.js";
import { formatCurrency } from "./orderUtils.jsx";

const EMPTY_FORM = { customerId: "", promoCode: "", lines: [{ productId: "", quantity: 1 }] };
const EMPTY_QUOTE = { subTotal: 0, discountAmount: 0, total: 0, promoApplied: false, promoCode: "", promoMessage: "" };

/** Création d'une commande depuis le back-office (client, lignes, code promo). */
export default function CreateOrderModal({ isOpen, onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [quote, setQuote] = useState(EMPTY_QUOTE);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || (customers.length > 0 && products.length > 0)) return;
    backofficeApi
      .orderCreateBootstrap(0, 50, 0, 200)
      .then((data) => {
        setCustomers(Array.isArray(data?.customers) ? data.customers : []);
        setProducts(Array.isArray(data?.products) ? data.products : []);
      })
      .catch(() => {});
  }, [isOpen, customers.length, products.length]);

  const productIndex = useMemo(() => new Map((products || []).filter((p) => p?.id).map((p) => [p.id, p])), [products]);

  const lines = useMemo(
    () =>
      (form.lines || [])
        .map((l) => ({ productId: l.productId, quantity: Math.trunc(Number(l.quantity)) }))
        .filter((l) => l.productId && Number.isFinite(l.quantity) && l.quantity > 0),
    [form.lines]
  );

  const localTotal = useMemo(
    () => lines.reduce((sum, l) => sum + (Number(productIndex.get(l.productId)?.price) || 0) * l.quantity, 0),
    [lines, productIndex]
  );

  useEffect(() => {
    if (!isOpen) return;
    const promoCode = form.promoCode.trim();
    setQuoteError("");
    setQuoteLoading(false);
    const fallback = {
      ...EMPTY_QUOTE,
      subTotal: localTotal,
      total: localTotal,
      promoCode,
      promoMessage: promoCode ? "Code promo non appliqué" : ""
    };
    if (!form.customerId || lines.length === 0 || !promoCode) {
      setQuote(promoCode ? fallback : { ...fallback, promoMessage: "" });
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    const timer = setTimeout(() => {
      backofficeApi
        .orderQuote({ customerId: form.customerId, promoCode, lines })
        .then((res) => !cancelled && setQuote(res))
        .catch((err) => {
          if (cancelled) return;
          setQuoteError(err?.message || "Impossible d'évaluer le code promo.");
          setQuote(fallback);
        })
        .finally(() => !cancelled && setQuoteLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, form.customerId, form.promoCode, lines, localTotal]);

  function close() {
    if (saving) return;
    setError("");
    onClose();
  }

  async function submit() {
    if (!form.customerId) return setError("Sélectionne un client.");
    if (lines.length === 0) return setError("Sélectionne au moins un produit avec une quantité valide.");
    const promoCode = form.promoCode.trim();
    if (promoCode && !quoteLoading && quote.promoApplied === false) {
      return setError(quote.promoMessage || "Code promo invalide.");
    }
    setSaving(true);
    setError("");
    try {
      const created = await backofficeApi.createOrder({ customerId: form.customerId, promoCode: promoCode || undefined, lines });
      setForm(EMPTY_FORM);
      onCreated?.(created);
    } catch (err) {
      setError(err?.message || "Impossible de créer la commande.");
    } finally {
      setSaving(false);
    }
  }

  const setLine = (idx, patch) =>
    setForm((p) => ({ ...p, lines: p.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)) }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Nouvelle commande"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Création..." : "Créer"}
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Client</p>
            <Select value={form.customerId} onChange={(e) => setForm((p) => ({ ...p, customerId: e.target.value }))}>
              <option value="">Sélectionner…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} • {c.email}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Lignes</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForm((p) => ({ ...p, lines: [...p.lines, { productId: "", quantity: 1 }] }))}
              >
                Ajouter
              </Button>
            </div>
            <div className="space-y-3">
              {form.lines.map((line, idx) => {
                const price = Number(productIndex.get(line.productId)?.price) || 0;
                const qty = Number(line.quantity);
                return (
                  <div key={idx} className="space-y-3 rounded-lg border border-border p-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-2 md:col-span-2">
                        <p className="text-xs text-muted-foreground">Produit</p>
                        <Select value={line.productId} onChange={(e) => setLine(idx, { productId: e.target.value })}>
                          <option value="">Sélectionner…</option>
                          {products
                            .slice()
                            .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} • {formatCurrency(p.price)}
                              </option>
                            ))}
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Quantité</p>
                        <Input type="number" min={1} value={line.quantity} onChange={(e) => setLine(idx, { quantity: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Total ligne</span>
                      <span className="font-semibold text-foreground">{formatCurrency(Number.isFinite(qty) ? price * qty : 0)}</span>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setForm((p) => ({ ...p, lines: p.lines.filter((_, i) => i !== idx) }))}
                        disabled={form.lines.length <= 1}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Code promo</p>
            <Input placeholder="Ex: WELCOME10" value={form.promoCode} onChange={(e) => setForm((p) => ({ ...p, promoCode: e.target.value }))} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{quoteLoading ? "Vérification du code..." : quote?.promoMessage || "Optionnel"}</span>
              {quoteError ? <span className="text-red-600">{quoteError}</span> : null}
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <Card className="h-fit space-y-3 p-4">
          <p className="text-sm font-semibold">Résumé</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nombre de lignes</span>
              <span className="font-semibold">{form.lines.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-semibold">{formatCurrency(quote?.subTotal ?? localTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Réduction</span>
              <span className={`font-semibold ${Number(quote?.discountAmount) > 0 ? "text-green-600" : ""}`}>
                -{formatCurrency(quote?.discountAmount ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-semibold">{formatCurrency(quote?.total ?? localTotal)}</span>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            La commande est créée « en attente de paiement ». Elle passe en préparation puis en livraison depuis sa fiche.
          </div>
        </Card>
      </div>
    </Modal>
  );
}
