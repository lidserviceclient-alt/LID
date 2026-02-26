import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, RotateCcw, Trash2, XCircle } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Label from "../components/ui/Label.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `${value}`;
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
};

const statusLabel = (r) => {
  if (r?.deletedAt) return "SUPPRIMÉ";
  if (r?.validated) return "VALIDÉ";
  return "EN ATTENTE";
};

const statusVariant = (label) => {
  if (label === "VALIDÉ") return "success";
  if (label === "EN ATTENTE") return "warning";
  if (label === "SUPPRIMÉ") return "destructive";
  return "neutral";
};

export default function ProductReviews() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState({ content: [], totalPages: 1, totalElements: 0 });
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [productId, setProductId] = useState("");
  const [userId, setUserId] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, content: "", validated: true });
  const [saving, setSaving] = useState(false);

  async function load(nextPage = page) {
    setLoading(true);
    setError("");
    try {
      const res = await backofficeApi.productReviews(nextPage, 20, status, q, productId, userId);
      const content = Array.isArray(res?.content) ? res.content : [];
      setPageData({
        content,
        totalPages: Number(res?.totalPages) || 1,
        totalElements: Number(res?.totalElements) || content.length
      });
      setPage(Number(res?.number) || nextPage);
    } catch (e) {
      setError(e?.message || "Impossible de charger les avis.");
      setPageData({ content: [], totalPages: 1, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0);
  }, [status]);

  const rows = useMemo(() => pageData.content || [], [pageData.content]);

  const open = async (row) => {
    if (!row?.id) return;
    setError("");
    try {
      const full = await backofficeApi.productReview(row.id);
      setSelected(full);
      setEditForm({
        rating: Number(full?.rating) || 5,
        content: `${full?.content || ""}`,
        validated: full?.validated !== false
      });
      setModalOpen(true);
    } catch (e) {
      setError(e?.message || "Impossible d'ouvrir l'avis.");
    }
  };

  const save = async () => {
    if (!selected?.id) return;
    if (!`${editForm.content || ""}`.trim()) return;
    setSaving(true);
    setError("");
    try {
      await backofficeApi.updateProductReview(selected.id, {
        rating: Number(editForm.rating) || 5,
        content: `${editForm.content}`.trim(),
        validated: Boolean(editForm.validated)
      });
      setModalOpen(false);
      setSelected(null);
      await load(page);
    } catch (e) {
      setError(e?.message || "Sauvegarde impossible.");
    } finally {
      setSaving(false);
    }
  };

  const toggleValidate = async (row) => {
    if (!row?.id) return;
    setError("");
    try {
      if (row.validated) await backofficeApi.unvalidateProductReview(row.id);
      else await backofficeApi.validateProductReview(row.id);
      await load(page);
    } catch (e) {
      setError(e?.message || "Action impossible.");
    }
  };

  const restore = async (row) => {
    if (!row?.id) return;
    setError("");
    try {
      await backofficeApi.restoreProductReview(row.id);
      await load(page);
    } catch (e) {
      setError(e?.message || "Restauration impossible.");
    }
  };

  const remove = async (row) => {
    if (!row?.id) return;
    const confirm = window.confirm("Supprimer cet avis ?");
    if (!confirm) return;
    setError("");
    try {
      await backofficeApi.deleteProductReview(row.id);
      if (selected?.id === row.id) {
        setModalOpen(false);
        setSelected(null);
      }
      await load(page);
    } catch (e) {
      setError(e?.message || "Suppression impossible.");
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20">
          <p className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      ) : null}

      <SectionHeader title="Avis produits" subtitle="Modérez et gérez les commentaires des produits." />

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-end gap-3 justify-between mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
            <div className="space-y-1">
              <Label>Recherche</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Produit, email, contenu…" />
            </div>
            <div className="space-y-1">
              <Label>Statut</Label>
              <Select
                value={status}
                onChange={(e) => {
                  setPage(0);
                  setStatus(e.target.value);
                }}
                options={[
                  { label: "Tous", value: "ALL" },
                  { label: "En attente", value: "PENDING" },
                  { label: "Validés", value: "VALIDATED" },
                  { label: "Signalés", value: "REPORTED" },
                  { label: "Supprimés", value: "DELETED" }
                ]}
              />
            </div>
            <div className="space-y-1">
              <Label>Produit (ID)</Label>
              <Input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Optionnel" />
            </div>
            <div className="space-y-1">
              <Label>Utilisateur (ID)</Label>
              <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Optionnel" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPage(0);
                load(0);
              }}
              disabled={loading}
            >
              Filtrer
            </Button>
            <Button variant="outline" size="sm" onClick={() => load(page)} disabled={loading}>
              Rafraîchir
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
          <div>{pageData.totalElements} avis</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || page <= 0}
              onClick={() => load(Math.max(0, page - 1))}
            >
              Précédent
            </Button>
            <div className="text-xs">
              Page {page + 1} / {pageData.totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || page + 1 >= (pageData.totalPages || 1)}
              onClick={() => load(page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>

        <Table>
          <THead>
            <TRow>
              <TCell>Produit</TCell>
              <TCell>Utilisateur</TCell>
              <TCell>Note</TCell>
              <TCell>Statut</TCell>
              <TCell>Signalements</TCell>
              <TCell>Créé</TCell>
              <TCell className="text-right">Actions</TCell>
            </TRow>
          </THead>
          <tbody>
            {loading ? (
              <TRow>
                <TCell className="text-muted-foreground">Chargement…</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : rows.length === 0 ? (
              <TRow>
                <TCell className="text-muted-foreground">Aucun avis.</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : (
              rows.map((r) => {
                const label = statusLabel(r);
                return (
                  <TRow key={r.id} className="group hover:bg-muted/50 transition-colors">
                    <TCell>
                      <div className="font-semibold text-foreground line-clamp-1">{r.productName || r.productId || "-"}</div>
                      <div className="text-xs text-muted-foreground">{r.productId || "-"}</div>
                    </TCell>
                    <TCell>
                      <div className="font-semibold text-foreground line-clamp-1">{r.userEmail || r.userId || "-"}</div>
                      <div className="text-xs text-muted-foreground">{r.userId || "-"}</div>
                    </TCell>
                    <TCell className="font-semibold">{r.rating ?? "-"}</TCell>
                    <TCell>
                      <div className="flex items-center gap-2">
                        <Badge label={label} variant={statusVariant(label)} />
                        {Number(r.reportCount) > 0 ? <Badge label="SIGNALÉ" variant="warning" /> : null}
                      </div>
                    </TCell>
                    <TCell className="text-sm">{Number(r.reportCount) || 0}</TCell>
                    <TCell className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</TCell>
                    <TCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" type="button" onClick={() => open(r)}>
                          <Eye className="h-4 w-4 text-slate-500 hover:text-primary" />
                        </Button>
                        {r.deletedAt ? (
                          <Button variant="ghost" size="sm" type="button" onClick={() => restore(r)}>
                            <RotateCcw className="h-4 w-4 text-slate-500 hover:text-primary" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" type="button" onClick={() => toggleValidate(r)}>
                            {r.validated ? (
                              <XCircle className="h-4 w-4 text-slate-500 hover:text-destructive" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-slate-500 hover:text-primary" />
                            )}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" type="button" onClick={() => remove(r)}>
                          <Trash2 className="h-4 w-4 text-slate-500 hover:text-destructive" />
                        </Button>
                      </div>
                    </TCell>
                  </TRow>
                );
              })
            )}
          </tbody>
        </Table>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        title="Modifier l'avis"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={save} disabled={saving || !`${editForm.content || ""}`.trim()}>
              Enregistrer
            </Button>
          </>
        }
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Produit</div>
              <div className="font-semibold text-foreground">{selected?.productName || selected?.productId || "-"}</div>
              <div className="text-xs text-muted-foreground">{selected?.productId || "-"}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Utilisateur</div>
              <div className="font-semibold text-foreground">{selected?.userEmail || selected?.userId || "-"}</div>
              <div className="text-xs text-muted-foreground">{selected?.userId || "-"}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Créé</div>
              <div className="font-semibold text-foreground">{formatDateTime(selected?.createdAt)}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Signalements</div>
              <div className="font-semibold text-foreground">{Number(selected?.reportCount) || 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Note</Label>
              <Select
                value={`${editForm.rating}`}
                onChange={(e) => setEditForm((p) => ({ ...p, rating: Number(e.target.value) }))}
                options={[
                  { label: "1", value: 1 },
                  { label: "2", value: 2 },
                  { label: "3", value: 3 },
                  { label: "4", value: 4 },
                  { label: "5", value: 5 }
                ]}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Validation</Label>
              <Select
                value={editForm.validated ? "true" : "false"}
                onChange={(e) => setEditForm((p) => ({ ...p, validated: e.target.value === "true" }))}
                options={[
                  { label: "Validé", value: "true" },
                  { label: "En attente", value: "false" }
                ]}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Commentaire</Label>
            <textarea
              value={editForm.content}
              onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))}
              rows={6}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

