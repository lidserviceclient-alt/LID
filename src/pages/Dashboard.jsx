import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Progress from "../components/ui/Progress.jsx";
import Sparkline from "../components/charts/Sparkline.jsx";
import LineChart from "../components/charts/LineChart.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { useOverviewContext } from "../contexts/OverviewContext.jsx";
import { useApiStatus } from "../services/apiStatus.js";import { StatusBadge, formatCurrency, formatDateTime } from "../components/orders/orderUtils.jsx";

// Toutes les données viennent de GET /api/v1/backoffice/overview : aucune valeur de démonstration.

const SERIES_DAYS = 12;

// Ancien libellé réduit (champ `status`) -> statut réel, pour une API qui n'enverrait pas encore `currentStatus`
const LEGACY_STATUS = {
  CREEE: "PENDING",
  PAYEE: "PAID",
  EXPEDIEE: "DELIVERY_IN_PROGRESS",
  LIVREE: "DELIVERED",
  ANNULEE: "CANCELED",
  REMBOURSEE: "REFUNDED"
};

const PIPELINE_META = {
  Nouvelles: { label: "En attente de paiement", color: "bg-amber-500" },
  "En preparation": { label: "Payées / en préparation", color: "bg-primary" },
  Expediees: { label: "Prêtes / en livraison", color: "bg-emerald-500" },
  Retours: { label: "Annulées / remboursées", color: "bg-rose-500" }
};

const formatInt = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}`;
  return new Intl.NumberFormat("fr-FR").format(num);
};

const formatCompact = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}`;
  if (num >= 1_000_000) {
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(num / 1_000_000)} M FCFA`;
  }
  if (num >= 1_000) {
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(num / 1_000)} K FCFA`;
  }
  return formatCurrency(num);
};

const toNumbers = (list) => (Array.isArray(list) ? list.map((v) => Number(v) || 0) : []);
const sum = (list) => list.reduce((acc, v) => acc + v, 0);

function EmptyState({ children }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

function Placeholder({ className = "h-4 w-full" }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

export default function Dashboard() {
  const [isReportOpen, setIsReportOpen] = useState(false);

  const navigate = useNavigate();
  const { getOverviewEntry, loadOverview } = useOverviewContext();
  const overviewEntry = getOverviewEntry();
  const overview = overviewEntry.data;
  const isRefreshing = overviewEntry.loading;
  const error = overviewEntry.error;
  const { unreachable } = useApiStatus();  const lastUpdatedAt = overviewEntry.lastUpdatedAt ? new Date(overviewEntry.lastUpdatedAt) : null;
  // Pas encore de données ni d'erreur : premier chargement (y compris avant le lancement de la requête)
  const isInitialLoading = !overview && !error;

  useEffect(() => {
    loadOverview(undefined).catch(() => {});
  }, [loadOverview]);

  const reload = () => loadOverview(undefined, { force: true }).catch(() => {});

  const dashboard = overview?.dashboard || null;

  const recentOrders = useMemo(
    () =>
      (Array.isArray(overview?.recentOrders) ? overview.recentOrders : []).map((order) => ({
        id: order.id,
        customer: order.customer || "-",
        items: order.items,
        amount: formatCurrency(order.total),
        status: order.currentStatus || LEGACY_STATUS[order.status] || order.status,
        date: order.dateCreation
      })),
    [overview]
  );

  const ordersSeries = useMemo(() => toNumbers(overview?.analyticsSeries), [overview]);
  const promoSeries = useMemo(() => toNumbers(overview?.promoUsageSeries), [overview]);

  const pipeline = useMemo(() => {
    const steps = (Array.isArray(overview?.orderPipeline) ? overview.orderPipeline : []).map((step) => ({
      key: step.label,
      label: PIPELINE_META[step.label]?.label || step.label,
      color: PIPELINE_META[step.label]?.color || "bg-primary",
      value: Number(step.value) || 0
    }));
    const max = Math.max(1, ...steps.map((s) => s.value));
    return steps.map((s) => ({ ...s, percent: (s.value / max) * 100 }));
  }, [overview]);

  const lowStock = Array.isArray(overview?.lowStock) ? overview.lowStock : [];
  const topProducts = Array.isArray(overview?.topProducts) ? overview.topProducts : [];
  const teamActivity = Array.isArray(overview?.teamActivity) ? overview.teamActivity : [];
  const teamProductivity = overview?.teamProductivity || null;

  const kpis = [
    {
      label: "Chiffre d'affaires",
      value: dashboard ? formatCurrency(dashboard.totalRevenue) : null,
      hint: "Montant cumulé des commandes"
    },
    {
      label: "Commandes",
      value: dashboard ? formatInt(dashboard.totalOrders) : null,
      hint: `Total · courbe : commandes / jour (${SERIES_DAYS} j)`,
      series: ordersSeries
    },
    {
      label: "En attente de paiement",
      value: dashboard ? formatInt(dashboard.pendingOrders) : null,
      hint: "Commandes non encore payées"
    },
    {
      label: "Clients",
      value: dashboard ? formatInt(dashboard.customers) : null,
      hint: `${dashboard ? formatInt(dashboard.activeProducts) : "-"} produits actifs · ${
        dashboard ? formatInt(dashboard.lowStock) : "-"
      } sous le seuil de stock`
    }
  ];

  const downloadReport = () => {
    if (!overview) return;
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    const blob = new Blob([JSON.stringify({ generatedAt: new Date().toISOString(), ...overview }, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lid-backoffice-report-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="space-y-6">
        <SectionHeader
          title="Tableau de bord"
          subtitle={
            lastUpdatedAt
              ? `Vue d'ensemble des opérations · mis à jour le ${lastUpdatedAt.toLocaleString("fr-FR")}`
              : "Vue d'ensemble des opérations et de la performance."
          }
          rightSlot={
            <>
              <Button variant="outline" onClick={reload} disabled={isRefreshing}>
                {isRefreshing ? "Synchronisation..." : "Synchroniser"}
              </Button>
              <Button onClick={() => setIsReportOpen(true)} disabled={!overview}>
                Exporter
              </Button>
            </>
          }
        />

        {error ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="text-sm">
              <p className="font-semibold text-destructive">Impossible de charger le tableau de bord.</p>
              <p className="text-muted-foreground">
                {unreachable ? "Le serveur ne répond pas (voir l'information en bas de page)." : error}
                {overview ? " Les chiffres affichés sont ceux du dernier chargement réussi." : ""}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={reload} disabled={isRefreshing}>
              Réessayer
            </Button>
          </div>
        ) : null}

        {!overview && error ? null : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => (
                <Card key={kpi.label} className="flex flex-col gap-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                  <div className="flex items-end justify-between gap-3">
                    {kpi.value === null ? (
                      <Placeholder className="h-8 w-32" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    )}
                    {kpi.series && kpi.series.length > 1 && sum(kpi.series) > 0 ? (
                      <div className="w-24">
                        <Sparkline data={kpi.series} color="hsl(var(--primary))" />
                      </div>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{kpi.hint}</p>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 space-y-6">
                <SectionHeader
                  title="Performance des ventes"
                  subtitle={`Commandes par jour (${SERIES_DAYS} derniers jours) et répartition par statut`}
                />
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2">
                    {isInitialLoading ? (
                      <Placeholder className="h-56 w-full" />
                    ) : sum(ordersSeries) > 0 ? (
                      <LineChart data={ordersSeries} className="h-56" stroke="hsl(var(--foreground))" />
                    ) : (
                      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-border">
                        <EmptyState>Aucune commande sur la période.</EmptyState>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    {isInitialLoading
                      ? [0, 1, 2, 3].map((i) => <Placeholder key={i} className="h-8 w-full" />)
                      : pipeline.map((step) => (
                          <div key={step.key} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{step.label}</span>
                              <span className="font-semibold text-foreground">{formatInt(step.value)}</span>
                            </div>
                            <Progress value={step.percent} barClass={step.color} />
                          </div>
                        ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Codes promo</p>
                      <p className="text-xs text-muted-foreground">
                        Utilisations par jour ({SERIES_DAYS} derniers jours) · total {formatInt(sum(promoSeries))}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/promo-codes")}>
                      Gérer
                    </Button>
                  </div>
                  {sum(promoSeries) > 0 ? (
                    <LineChart data={promoSeries} className="h-24" />
                  ) : (
                    <p className="text-xs text-muted-foreground">Aucun code promo utilisé sur la période.</p>
                  )}
                </div>
              </Card>

              <Card className="space-y-6">
                <SectionHeader title="Alertes stock" subtitle="Produits sous le seuil" />
                <div className="space-y-4">
                  {isInitialLoading ? (
                    [0, 1, 2].map((i) => <Placeholder key={i} className="h-8 w-full" />)
                  ) : lowStock.length ? (
                    lowStock.map((item, idx) => (
                      <div key={item.sku || `${item.name}-${idx}`} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{item.name || "-"}</p>
                          <p className="text-xs text-muted-foreground">
                            {[item.sku, item.supplier].filter(Boolean).join(" • ") || "-"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatInt(item.stock)} / {formatInt(item.threshold)}
                          </span>
                          <Badge label="Faible" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState>Aucun produit sous le seuil de stock.</EmptyState>
                  )}
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate("/inventory")}>
                  Ouvrir l'inventaire
                </Button>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <SectionHeader
                  title="Dernières commandes"
                  subtitle="Les 5 plus récentes"
                  rightSlot={
                    <Button variant="outline" size="sm" onClick={() => navigate("/orders")}>
                      Voir toutes
                    </Button>
                  }
                />
                <div className="mt-4">
                  {isInitialLoading ? (
                    <div className="space-y-3">
                      {[0, 1, 2].map((i) => (
                        <Placeholder key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : recentOrders.length ? (
                    <Table>
                      <THead>
                        <TRow>
                          <TCell>Commande</TCell>
                          <TCell>Client</TCell>
                          <TCell>Date</TCell>
                          <TCell>Montant</TCell>
                          <TCell>Statut</TCell>
                        </TRow>
                      </THead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <TRow
                            key={order.id}
                            className="cursor-pointer"
                            onClick={() => order.id && navigate(`/orders/${encodeURIComponent(order.id)}`)}
                          >
                            <TCell className="font-semibold text-foreground">{order.id}</TCell>
                            <TCell>{order.customer}</TCell>
                            <TCell className="whitespace-nowrap">{formatDateTime(order.date)}</TCell>
                            <TCell className="whitespace-nowrap">{order.amount}</TCell>
                            <TCell>
                              <StatusBadge status={order.status} />
                            </TCell>
                          </TRow>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <EmptyState>Aucune commande pour le moment.</EmptyState>
                  )}
                </div>
              </Card>

              <Card className="space-y-6">
                <SectionHeader title="Top produits" subtitle="Par revenu (7 derniers jours, évolution vs 7 jours précédents)" />
                <div className="space-y-4">
                  {isInitialLoading ? (
                    [0, 1, 2].map((i) => <Placeholder key={i} className="h-8 w-full" />)
                  ) : topProducts.length ? (
                    topProducts.map((product, idx) => (
                      <div key={`${product.name}-${idx}`} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{product.name || "-"}</p>
                          <p className="text-xs text-muted-foreground">{product.category || "-"}</p>
                        </div>
                        <div className="text-right">
                          <p className="whitespace-nowrap text-sm font-semibold text-foreground">
                            {formatCompact(product.revenue)}
                          </p>
                          {product.delta ? (
                            <p
                              className={`text-xs ${
                                `${product.delta}`.startsWith("-") ? "text-destructive" : "text-emerald-600"
                              }`}
                            >
                              {product.delta}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState>Aucune vente sur les 7 derniers jours.</EmptyState>
                  )}
                </div>
              </Card>
            </div>

            <Card className="space-y-6">
              <SectionHeader title="Activité équipe" subtitle="Actions récentes du back-office" />
              {teamProductivity ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-muted/20 p-3">
                    <div className="text-xs text-muted-foreground">Tâches complétées</div>
                    <div className="text-lg font-semibold text-foreground">{formatInt(teamProductivity.tasksCompleted)}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-3">
                    <div className="text-xs text-muted-foreground">Membres actifs</div>
                    <div className="text-lg font-semibold text-foreground">{formatInt(teamProductivity.activeMembers)}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-3">
                    <div className="text-xs text-muted-foreground">Top performer</div>
                    <div className="text-lg font-semibold text-foreground">{teamProductivity.topPerformer || "-"}</div>
                  </div>
                </div>
              ) : null}

              {Array.isArray(teamProductivity?.performances) && teamProductivity.performances.length ? (
                <div className="rounded-lg border border-border bg-muted/10 p-3">
                  <div className="text-xs font-semibold text-foreground">Performances individuelles</div>
                  <div className="mt-2 space-y-2">
                    {teamProductivity.performances.slice(0, 5).map((p) => (
                      <div key={p.actor} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-foreground">{p.name || p.actor}</div>
                          <div className="text-xs text-muted-foreground">{p.role || "-"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-foreground">{p.tasksCompleted}</div>
                          <div className="text-xs text-muted-foreground">{Math.round((p.successRate || 0) * 100)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-4">
                {teamActivity.slice(0, 6).map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.role} • {item.action}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
                {!isInitialLoading && teamActivity.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucune activité récente.</div>
                ) : null}
              </div>
            </Card>
          </>
        )}
      </div>

      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Export - Vue d'ensemble"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsReportOpen(false)}>
              Fermer
            </Button>
            <Button variant="outline" onClick={() => navigate("/analytics")}>
              Ouvrir Analytics
            </Button>
            <Button onClick={downloadReport} disabled={!overview}>
              Télécharger (JSON)
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Export des données renvoyées par l'API pour la vue d'ensemble (partage ou audit).
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/60 p-3 bg-muted/20">
              <p className="text-xs text-muted-foreground">Dernière mise à jour</p>
              <p className="font-semibold text-foreground">{lastUpdatedAt ? lastUpdatedAt.toLocaleString("fr-FR") : "-"}</p>
            </div>
            <div className="rounded-lg border border-border/60 p-3 bg-muted/20">
              <p className="text-xs text-muted-foreground">Commandes récentes</p>
              <p className="font-semibold text-foreground">{recentOrders.length}</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
