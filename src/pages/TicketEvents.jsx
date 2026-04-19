import { useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, AlertCircle, Calendar as CalendarIcon, Package2, Minus, PlusCircle } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Label from "../components/ui/Label.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";
import { reloadTicketEventsResolver, useTicketEventsResolver } from "../resolvers/ticketEventsResolver.js";

const formatDateTime = (value) => {
  if (!value) return "-";
  const s = `${value}`.trim();
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("fr-FR");
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return `${value}`;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(num))} FCFA`;
};

const toDateTimeLocalValue = (value) => {
  const s = `${value || ""}`.trim();
  if (!s) return "";
  return s.length >= 16 ? s.slice(0, 16) : s;
};

const normalizeDateTime = (value) => {
  const s = `${value || ""}`.trim();
  if (!s) return null;
  if (s.length === 16) return `${s}:00`;
  return s;
};

export default function TicketEvents() {
  const eventsEntry = useTicketEventsResolver();
  const events = Array.isArray(eventsEntry.data) ? eventsEntry.data : [];
  const isLoading = eventsEntry.loading;
  const error = eventsEntry.error;

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [inventoryQuantity, setInventoryQuantity] = useState("1");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    price: "",
    quantityAvailable: "0",
    imageUrl: "",
    category: "",
    available: true,
    description: ""
  });

  const categories = useMemo(() => {
    const set = new Set();
    (events || []).forEach((p) => {
      const c = (p?.category || "").trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (events || [])
      .slice()
      .sort((a, b) => `${b?.date || ""}`.localeCompare(`${a?.date || ""}`))
      .filter((p) => {
        const matchesQuery =
          !q ||
          `${p.title || ""}`.toLowerCase().includes(q) ||
          `${p.location || ""}`.toLowerCase().includes(q);
        const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
        const avail = Boolean(p.available);
        const matchesAvailability =
          availabilityFilter === "ALL" ||
          (availabilityFilter === "YES" && avail) ||
          (availabilityFilter === "NO" && !avail);
        return matchesQuery && matchesCategory && matchesAvailability;
      });
  }, [events, query, categoryFilter, availabilityFilter]);

  const openCreate = () => {
    setCurrent(null);
    setFormError("");
    setForm({
      title: "",
      date: "",
      location: "",
      price: "",
      quantityAvailable: "0",
      imageUrl: "",
      category: "",
      available: true,
      description: ""
    });
    setIsFormOpen(true);
  };

  const openEdit = (row) => {
    setCurrent(row);
    setFormError("");
    setForm({
      title: row?.title || "",
      date: row?.date || "",
      location: row?.location || "",
      price: row?.price === null || row?.price === undefined ? "" : `${row.price}`,
      quantityAvailable: row?.quantityAvailable === null || row?.quantityAvailable === undefined ? "0" : `${row.quantityAvailable}`,
      imageUrl: row?.imageUrl || "",
      category: row?.category || "",
      available: Boolean(row?.available),
      description: row?.description || ""
    });
    setIsFormOpen(true);
  };

  const openDelete = (row) => {
    setCurrent(row);
    setIsDeleteOpen(true);
  };

  const save = async () => {
    const title = form.title.trim();
    if (!title) {
      setFormError("Titre obligatoire.");
      return;
    }
    const price = form.price === "" ? null : Number(form.price);
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setFormError("Prix invalide.");
      return;
    }
    const quantityAvailable = Number(form.quantityAvailable);
    if (!Number.isFinite(quantityAvailable) || quantityAvailable < 0 || !Number.isInteger(quantityAvailable)) {
      setFormError("Stock initial invalide.");
      return;
    }
    const payload = {
      title,
      date: normalizeDateTime(form.date),
      location: form.location.trim(),
      price,
      imageUrl: form.imageUrl.trim(),
      category: form.category.trim(),
      available: Boolean(form.available),
      quantityAvailable,
      quantityReserved: current?.quantityReserved ?? 0,
      description: form.description.trim()
    };
    setSaving(true);
    setFormError("");
    try {
      if (current?.id) {
        await backofficeApi.updateTicketEvent(current.id, payload);
      } else {
        await backofficeApi.createTicketEvent(payload);
      }
      setIsFormOpen(false);
      await reloadTicketEventsResolver();
    } catch (err) {
      setFormError(err?.message || "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!current?.id) return;
    setSaving(true);
    setFormError("");
    try {
      await backofficeApi.deleteTicketEvent(current.id);
      setIsDeleteOpen(false);
      setCurrent(null);
      await reloadTicketEventsResolver();
    } catch (err) {
      setFormError(err?.message || "Échec de la suppression.");
    } finally {
      setSaving(false);
    }
  };

  const openInventory = async (row) => {
    setCurrent(row);
    setInventory(row);
    setInventoryQuantity("1");
    setFormError("");
    setIsInventoryOpen(true);
    try {
      const res = await backofficeApi.ticketInventory(row.id);
      setInventory(res);
    } catch (err) {
      setFormError(err?.message || "Impossible de charger le stock.");
    }
  };

  const adjustInventory = async (mode) => {
    if (!current?.id) return;
    const qty = Number(inventoryQuantity);
    if (!Number.isFinite(qty) || qty < 0) {
      setFormError("Quantité invalide.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const res = await backofficeApi.adjustTicketInventory(current.id, { mode, quantity: qty });
      setInventory(res);
      await reloadTicketEventsResolver();
    } catch (err) {
      setFormError(err?.message || "Échec de mise à jour du stock.");
    } finally {
      setSaving(false);
    }
  };

  const ticketStatus = (row) => {
    if (!row?.available) return { label: "Désactivé", variant: "default" };
    if (!row?.sellable) return { label: "Rupture", variant: "default" };
    return { label: "En vente", variant: "outline" };
  };

  return (
    <>
      <div className="space-y-6">
        <SectionHeader
          title="Billetterie"
          subtitle="Gérez les événements et leurs disponibilités"
          rightSlot={
            <div className="flex gap-2">
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel événement
              </Button>
            </div>
          }
        />

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b bg-muted/30 grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Rechercher titre, lieu..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Catégorie</p>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="ALL">Toutes</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Disponibilité</p>
              <Select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
                <option value="ALL">Toutes</option>
                <option value="YES">Disponible</option>
                <option value="NO">Indisponible</option>
              </Select>
            </div>
            {error && (
              <div className="p-3 rounded-lg border border-border bg-muted/30 text-sm text-destructive flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>

          <Table>
            <THead
              columns={[
                { label: "Événement", width: "26%" },
                { label: "Date", width: "20%" },
                { label: "Catégorie", width: "12%" },
                { label: "Prix", width: "12%" },
                { label: "Quantité", width: "10%" },
                { label: "Statut", width: "10%" },
                { label: "", width: "10%" }
              ]}
            />
            <tbody>
              {filtered.map((p) => (
                <TRow key={p.id}>
                  <TCell>
                    <div className="flex items-center gap-3">
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-lg object-cover border border-border" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.location || "-"}</p>
                      </div>
                    </div>
                  </TCell>
                  <TCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon size={16} /> {formatDateTime(p.date)}
                    </div>
                  </TCell>
                  <TCell><Badge label={p.category || "-"} /></TCell>
                  <TCell>{formatCurrency(p.price)}</TCell>
                  <TCell>
                    <p className="text-sm font-semibold">{Number(p.quantityAvailable) || 0}</p>
                  </TCell>
                  <TCell>
                    <Badge label={ticketStatus(p).label} variant={ticketStatus(p).variant} />
                  </TCell>
                  <TCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openInventory(p)}>
                        <Package2 className="mr-2 h-4 w-4" />
                        Stock
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                      <Button variant="outline" className="text-destructive border-destructive/40" size="sm" onClick={() => openDelete(p)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </TCell>
                </TRow>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                    {isLoading ? "Chargement..." : "Aucun événement"}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={current?.id ? "Modifier l’événement" : "Nouvel événement"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </>
        }
      >
        {formError && (
          <div className="mb-3 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-sm text-destructive flex items-center gap-2">
            <AlertCircle size={16} /> {formError}
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label required>Titre</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="datetime-local" value={toDateTimeLocalValue(form.date)} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Lieu</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Prix</Label>
            <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Stock initial</Label>
            <Input
              type="number"
              min="0"
              step="1"
              value={form.quantityAvailable}
              onChange={(e) => setForm({ ...form, quantityAvailable: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Disponibilité</Label>
            <Select value={form.available ? "YES" : "NO"} onChange={(e) => setForm({ ...form, available: e.target.value === "YES" })}>
              <option value="YES">Disponible</option>
              <option value="NO">Indisponible</option>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Image (URL)</Label>
            <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Description</Label>
            <textarea
              className="w-full rounded-md border border-border bg-background p-2 text-sm"
              rows={6}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Supprimer l’événement"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button variant="outline" className="text-destructive border-destructive/40" onClick={remove} disabled={saving}>
              Confirmer la suppression
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Confirmez la suppression de l’événement « {current?.title || "-"} ». Cette action est irréversible.
        </p>
      </Modal>

      <Modal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        title={`Stock billetterie${current?.title ? ` - ${current.title}` : ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsInventoryOpen(false)} disabled={saving}>
              Fermer
            </Button>
            <Button variant="outline" onClick={() => adjustInventory("DECREMENT")} disabled={saving}>
              <Minus className="mr-2 h-4 w-4" />
              Décrémenter
            </Button>
            <Button variant="outline" onClick={() => adjustInventory("INCREMENT")} disabled={saving}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Incrémenter
            </Button>
            <Button onClick={() => adjustInventory("SET")} disabled={saving}>
              Définir
            </Button>
          </>
        }
      >
        {formError && (
          <div className="mb-3 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-sm text-destructive flex items-center gap-2">
            <AlertCircle size={16} /> {formError}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Disponible</p>
            <p className="mt-2 text-2xl font-bold">{Number(inventory?.quantityAvailable) || 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Réservé</p>
            <p className="mt-2 text-2xl font-bold">{Number(inventory?.quantityReserved) || 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="mt-2 text-2xl font-bold">{Number(inventory?.quantityTotal) || 0}</p>
          </Card>
        </div>
        <div className="mt-6 space-y-2">
          <Label>Quantité</Label>
          <Input type="number" min="0" value={inventoryQuantity} onChange={(e) => setInventoryQuantity(e.target.value)} />
          <p className="text-xs text-muted-foreground">
            Définir remplace le stock disponible. Incrémenter et Décrémenter modifient uniquement le disponible.
          </p>
        </div>
      </Modal>
    </>
  );
}
