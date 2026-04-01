import { useEffect, useMemo, useState } from "react";
import { Check, X, Eye } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import Label from "../components/ui/Label.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tous" },
  { value: "UNDER_REVIEW", label: "En revue" },
  { value: "VERIFIED", label: "Approuvés" },
  { value: "REJECTED", label: "Refusés" },
  { value: "STEP_1_PENDING", label: "Étape 1" },
  { value: "STEP_2_PENDING", label: "Étape 2" },
  { value: "STEP_3_PENDING", label: "Étape 3" },
  { value: "STEP_4_PENDING", label: "Étape 4" }
];

const formatDate = (value) => {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("fr-FR");
};

const statusUi = (status) => {
  const s = `${status || ""}`.trim().toUpperCase();
  if (s === "VERIFIED") return { label: "Approuvé", variant: "success" };
  if (s === "UNDER_REVIEW") return { label: "En revue", variant: "warning" };
  if (s === "REJECTED") return { label: "Refusé", variant: "destructive" };
  if (s.startsWith("STEP_")) return { label: "En inscription", variant: "neutral" };
  return { label: s || "-", variant: "outline" };
};

export default function Partners() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("UNDER_REVIEW");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const statusOptions = useMemo(() => STATUS_OPTIONS, []);

  const loadPartners = async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await backofficeApi.partners(nextPage, size, status, q);
      setData(res);
      setPage(nextPage);
    } catch (err) {
      setError(err?.message || "Impossible de charger les partenaires.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    if (!id) return;
    setDetailLoading(true);
    setDetailError("");
    try {
      const res = await backofficeApi.partner(id);
      setDetail(res);
    } catch (err) {
      setDetailError(err?.message || "Impossible de charger le partenaire.");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadPartners(0).catch(() => {});
  }, [size, status]);

  const rows = Array.isArray(data?.content) ? data.content : [];
  const totalPages = Number.isFinite(Number(data?.totalPages)) ? Number(data.totalPages) : 0;

  const openDetail = async (id) => {
    setSelectedId(id);
    setDetail(null);
    setRejectComment("");
    await loadDetail(id);
  };

  const closeDetail = () => {
    setSelectedId("");
    setDetail(null);
    setRejectComment("");
    setConfirmAction(null);
  };

  const approve = async () => {
    if (!selectedId) return;
    setDecisionLoading(true);
    try {
      await backofficeApi.approvePartner(selectedId);
      await loadDetail(selectedId);
      await loadPartners(page);
    } catch (err) {
      setDetailError(err?.message || "Action impossible.");
    } finally {
      setDecisionLoading(false);
      setConfirmAction(null);
    }
  };

  const reject = async () => {
    if (!selectedId) return;
    setDecisionLoading(true);
    try {
      await backofficeApi.rejectPartner(selectedId, { comment: rejectComment });
      await loadDetail(selectedId);
      await loadPartners(page);
    } catch (err) {
      setDetailError(err?.message || "Action impossible.");
    } finally {
      setDecisionLoading(false);
      setConfirmAction(null);
    }
  };

  const headerRight = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-60">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (nom, email, boutique)…"
        />
      </div>
      <div className="w-44">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusOptions}
        />
      </div>
      <Button variant="outline" onClick={() => loadPartners(0)} disabled={loading}>
        {loading ? "Chargement..." : "Rechercher"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Partenaires"
        subtitle="Gérez les inscriptions, approuvez ou refusez les partenaires."
        rightSlot={headerRight}
      />

      {error ? (
        <div className="rounded-lg border border-border bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <Table>
          <THead>
            <TRow>
              <TCell>Partenaire</TCell>
              <TCell>Boutique</TCell>
              <TCell>Catégorie</TCell>
              <TCell>Statut</TCell>
              <TCell>Créé</TCell>
              <TCell className="text-right">Actions</TCell>
            </TRow>
          </THead>
          <tbody>
            {rows.map((row) => {
              const ui = statusUi(row?.registrationStatus);
              const fullName = `${row?.firstName || ""} ${row?.lastName || ""}`.trim() || "-";
              return (
                <TRow key={row.partnerId}>
                  <TCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">{fullName}</div>
                      <div className="text-xs text-muted-foreground">{row?.email || "-"}</div>
                    </div>
                  </TCell>
                  <TCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">{row?.shopName || "-"}</div>
                      <div className="text-xs text-muted-foreground">{row?.phoneNumber || "-"}</div>
                    </div>
                  </TCell>
                  <TCell>{row?.mainCategoryName || "-"}</TCell>
                  <TCell>
                    <Badge label={ui.label} variant={ui.variant} />
                  </TCell>
                  <TCell className="text-xs text-muted-foreground">{formatDate(row?.createdAt)}</TCell>
                  <TCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openDetail(row.partnerId)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir
                    </Button>
                  </TCell>
                </TRow>
              );
            })}
          </tbody>
        </Table>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="text-xs text-muted-foreground">
            Page {page + 1} / {Math.max(totalPages, 1)}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 0 || loading} onClick={() => loadPartners(page - 1)}>
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || totalPages === 0 || page >= totalPages - 1}
              onClick={() => loadPartners(page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={Boolean(selectedId)}
        onClose={closeDetail}
        title="Détails partenaire"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <div className="text-xs text-muted-foreground font-mono">{selectedId || ""}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={closeDetail}>
                Fermer
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmAction("reject")}
                disabled={decisionLoading || detailLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Refuser
              </Button>
              <Button
                onClick={() => setConfirmAction("approve")}
                disabled={decisionLoading || detailLoading}
              >
                <Check className="mr-2 h-4 w-4" />
                Approuver
              </Button>
            </div>
          </div>
        }
      >
        {detailLoading ? (
          <div className="text-sm text-muted-foreground">Chargement...</div>
        ) : detailError ? (
          <div className="text-sm text-destructive">{detailError}</div>
        ) : detail ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Nom</div>
                <div className="font-semibold text-foreground">
                  {`${detail.firstName || ""} ${detail.lastName || ""}`.trim() || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="font-semibold text-foreground">{detail.email || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Téléphone</div>
                <div className="font-semibold text-foreground">{detail.phoneNumber || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Statut</div>
                <div className="mt-1">
                  <Badge {...statusUi(detail.registrationStatus)} />
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Boutique</div>
                <div className="font-semibold text-foreground">{detail.shopName || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Catégorie principale</div>
                <div className="font-semibold text-foreground">{detail.mainCategoryId ?? "-"}</div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Adresse</div>
                <div className="font-semibold text-foreground">{detail.headOfficeAddress || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Ville / Pays</div>
                <div className="font-semibold text-foreground">
                  {[detail.city, detail.country].filter(Boolean).join(" / ") || "-"}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Contrat</div>
                <Badge label={detail.contractAccepted ? "Accepté" : "Non accepté"} variant={detail.contractAccepted ? "success" : "warning"} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Documents</div>
                <div className="space-y-1 text-sm">
                  {detail.businessRegistrationDocumentUrl ? (
                    <a className="text-primary underline" href={detail.businessRegistrationDocumentUrl} target="_blank" rel="noreferrer">
                      Registre commerce
                    </a>
                  ) : (
                    <div className="text-muted-foreground">Registre commerce: -</div>
                  )}
                  {detail.idDocumentUrl ? (
                    <a className="text-primary underline" href={detail.idDocumentUrl} target="_blank" rel="noreferrer">
                      Pièce identité
                    </a>
                  ) : (
                    <div className="text-muted-foreground">Pièce identité: -</div>
                  )}
                  {detail.nineaDocumentUrl ? (
                    <a className="text-primary underline" href={detail.nineaDocumentUrl} target="_blank" rel="noreferrer">
                      NINEA
                    </a>
                  ) : (
                    <div className="text-muted-foreground">NINEA: -</div>
                  )}
                </div>
              </div>
            </div>

            {confirmAction === "reject" ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="text-sm font-semibold text-foreground">Confirmer le refus</div>
                <div className="space-y-2">
                  <Label htmlFor="rejectComment">Motif (optionnel)</Label>
                  <Input
                    id="rejectComment"
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="Ex: documents incomplets"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={decisionLoading}>
                    Annuler
                  </Button>
                  <Button variant="destructive" onClick={reject} disabled={decisionLoading}>
                    {decisionLoading ? "Traitement..." : "Confirmer"}
                  </Button>
                </div>
              </div>
            ) : null}

            {confirmAction === "approve" ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="text-sm font-semibold text-foreground">Confirmer l’approbation</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={decisionLoading}>
                    Annuler
                  </Button>
                  <Button onClick={approve} disabled={decisionLoading}>
                    {decisionLoading ? "Traitement..." : "Confirmer"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Aucun contenu.</div>
        )}
      </Modal>
    </div>
  );
}
