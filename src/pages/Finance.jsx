import { useMemo, useState } from "react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";
import { useFinanceResolver } from "../resolvers/financeResolver.js";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return `${value}`;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(num))} FCFA`;
};

const formatMillions = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(num / 1_000_000)} M`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `${value}`;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
};

export default function Finance() {
  const [exporting, setExporting] = useState(false);
  const [pageError, setPageError] = useState("");
  const financeEntry = useFinanceResolver(30, 50);
  const overview = financeEntry.data?.overview || null;
  const transactions = Array.isArray(financeEntry.data?.transactions) ? financeEntry.data.transactions : [];
  const loading = financeEntry.loading;
  const error = pageError || financeEntry.error || "";

  const txRows = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    return list.map((tx) => {
      const amount = Number(tx.amount ?? 0);
      const isPositive = Number.isFinite(amount) ? amount >= 0 : true;
      const status = tx.status || "-";
      const success = status === "Succes" || status === "Complété" || status === "Succès";
      const pending = status === "En attente" || status === "En cours";
      return {
        id: tx.id,
        type: tx.type,
        method: tx.method,
        amount,
        status,
        badgeVariant: success ? "success" : pending ? "warning" : "neutral",
        date: tx.date
      };
    });
  }, [transactions]);

  async function exportCsv() {
    setExporting(true);
    setPageError("");
    try {
      const blob = await backofficeApi.financeExportCsv(30);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "finance-report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setPageError(err?.message || "Impossible d'exporter le rapport.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Finance"
        subtitle="Suivi de la trésorerie, paiements et réconciliations."
        rightSlot={
          <Button type="button" onClick={exportCsv} disabled={exporting}>
            {exporting ? "Export..." : "Exporter rapport"}
          </Button>
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 text-sm text-red-700 dark:text-red-200 p-3">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="space-y-2 bg-primary/5 border-primary/20">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Solde Disponible</p>
          <p className="text-2xl font-bold text-foreground">{loading ? "…" : formatCurrency(overview?.availableBalance ?? 0)}</p>
          <p className="text-xs text-muted-foreground">{overview?.updatedAt ? `Mis à jour ${formatDate(overview.updatedAt)}` : ""}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Encaissements (M)</p>
          <p className="text-2xl font-bold text-green-600">{loading ? "…" : `+${formatMillions(overview?.inflows ?? 0)}`}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Décaissements (M)</p>
          <p className="text-2xl font-bold text-red-600">{loading ? "…" : `-${formatMillions(overview?.outflows ?? 0)}`}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">En attente</p>
          <p className="text-2xl font-bold text-amber-600">{loading ? "…" : formatCurrency(overview?.pending ?? 0)}</p>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Dernières transactions" subtitle="Flux financier" />
        <Table>
          <THead>
            <TRow>
              <TCell>ID</TCell>
              <TCell>Type</TCell>
              <TCell>Méthode</TCell>
              <TCell>Montant</TCell>
              <TCell>Statut</TCell>
              <TCell>Date</TCell>
            </TRow>
          </THead>
          <tbody>
            {loading ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Chargement…</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : txRows.length === 0 ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Aucune transaction.</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : (
              txRows.map((tx) => (
                <TRow key={tx.id}>
                  <TCell className="font-mono text-xs">{tx.id}</TCell>
                  <TCell>{tx.type}</TCell>
                  <TCell>{tx.method}</TCell>
                  <TCell className={tx.amount >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                    {tx.amount >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(tx.amount))}
                  </TCell>
                  <TCell><Badge label={tx.status} variant={tx.badgeVariant} /></TCell>
                  <TCell>{formatDate(tx.date)}</TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
