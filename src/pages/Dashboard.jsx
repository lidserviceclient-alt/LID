import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  kpiData,
  orderPipeline,
  recentOrders,
  lowStock,
  topProducts,
  analyticsSeries,
  promoUsageSeries
} from "../data/mockData.js";
import { backofficeApi } from "../services/api.js";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Progress from "../components/ui/Progress.jsx";
import Sparkline from "../components/charts/Sparkline.jsx";
import LineChart from "../components/charts/LineChart.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}`;
  return `${new Intl.NumberFormat("fr-FR").format(num)} FCFA`;
};

const mapStatus = (status) => {
  if (!status) return "-";
  switch (status) {
    case "CREEE":
      return "Nouvelle";
    case "PAYEE":
      return "En preparation";
    case "EXPEDIEE":
      return "Expediee";
    case "LIVREE":
      return "Livree";
    case "ANNULEE":
      return "Retournee";
    case "REMBOURSEE":
      return "Retournee";
    default:
      return status;
  }
};

const formatCompact = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}`;
  if (num >= 1_000_000) {
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(num / 1_000_000)} M`;
  }
  if (num >= 1_000) {
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(num / 1_000)} K`;
  }
  return `${new Intl.NumberFormat("fr-FR").format(num)}`;
};

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [recentOrdersState, setRecentOrdersState] = useState(recentOrders);
  const [orderPipelineState, setOrderPipelineState] = useState(orderPipeline);
  const [analyticsSeriesState, setAnalyticsSeriesState] = useState(analyticsSeries);
  const [promoUsageSeriesState, setPromoUsageSeriesState] = useState(promoUsageSeries);
  const [lowStockState, setLowStockState] = useState(lowStock);
  const [topProductsState, setTopProductsState] = useState(topProducts);
  const [teamActivityState, setTeamActivityState] = useState([]);
  const [teamProductivityState, setTeamProductivityState] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [overviewRaw, setOverviewRaw] = useState(null);

  const navigate = useNavigate();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadOverview = async () => {
    setIsRefreshing(true);
    try {
      const data = await backofficeApi.overview();
      if (!mountedRef.current) return;

      setOverviewRaw(data);
      setLastUpdatedAt(new Date());

      if (data?.dashboard) {
        setDashboard(data.dashboard);
      }

      if (Array.isArray(data?.recentOrders)) {
        setRecentOrdersState(
          data.recentOrders.map((order) => ({
            id: order.id,
            customer: order.customer,
            channel: "Backoffice",
            amount: formatCurrency(order.total),
            status: mapStatus(order.status),
            date: order.dateCreation
          }))
        );
      }

      if (Array.isArray(data?.analyticsSeries)) {
        setAnalyticsSeriesState(data.analyticsSeries.map((v) => Number(v) || 0));
      }

      if (Array.isArray(data?.promoUsageSeries)) {
        setPromoUsageSeriesState(data.promoUsageSeries.map((v) => Number(v) || 0));
      }

      if (Array.isArray(data?.orderPipeline)) {
        const colors = {
          Nouvelles: "bg-teal-500",
          "En preparation": "bg-amber-500",
          Expediees: "bg-emerald-500",
          Retours: "bg-rose-500"
        };
        setOrderPipelineState(
          data.orderPipeline.map((step) => ({
            label: step.label,
            value: Number(step.value) || 0,
            color: colors[step.label] || "bg-primary"
          }))
        );
      }

      if (Array.isArray(data?.lowStock)) {
        setLowStockState(data.lowStock);
      }

      if (Array.isArray(data?.topProducts)) {
        setTopProductsState(
          data.topProducts.map((product) => ({
            name: product.name,
            category: product.category || "-",
            revenue: formatCompact(product.revenue),
            delta: product.delta || "+0%"
          }))
        );
      }

      setTeamActivityState(Array.isArray(data?.teamActivity) ? data.teamActivity : []);
      setTeamProductivityState(data?.teamProductivity || null);
    } catch {
      // keep mock data on failure
    } finally {
      if (mountedRef.current) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      loadOverview();
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const downloadReport = () => {
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    const payload = overviewRaw || {
      dashboard,
      recentOrders: recentOrdersState,
      orderPipeline: orderPipelineState,
      analyticsSeries: analyticsSeriesState,
      lowStock: lowStockState,
      topProducts: topProductsState
    };
    const blob = new Blob([JSON.stringify({ generatedAt: new Date().toISOString(), ...payload }, null, 2)], {
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

  const kpis = dashboard
    ? [
        {
          label: "Chiffre d'affaires",
          value: formatCurrency(dashboard.totalRevenue),
          trend: "Live",
          trendDirection: "up",
          hint: "Toutes commandes"
        },
        {
          label: "Commandes",
          value: `${dashboard.totalOrders}`,
          trend: "Live",
          trendDirection: "up",
          hint: "Total"
        },
        {
          label: "Commandes en attente",
          value: `${dashboard.pendingOrders}`,
          trend: "Live",
          trendDirection: "down",
          hint: "A traiter"
        },
        {
          label: "Clients actifs",
          value: `${dashboard.customers}`,
          trend: "Live",
          trendDirection: "up",
          hint: "Base client"
        }
      ]
    : kpiData;

  return (
    <>
    <div className="space-y-6">
      <SectionHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble des opérations et de la performance."
        rightSlot={
          <>
            <Button variant="outline" onClick={loadOverview} disabled={isRefreshing}>
              {isRefreshing ? "Synchronisation..." : "Synchroniser"}
            </Button>
            <Button onClick={() => setIsReportOpen(true)}>
              Planifier un rapport
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {kpi.label}
              </p>
              <span
                className={`text-xs font-semibold ${
                  kpi.trendDirection === "up" ? "text-emerald-600" : "text-destructive"
                }`}
              >
                {kpi.trend}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <div className="w-24">
                <Sparkline
                  data={analyticsSeriesState}
                  color={kpi.trendDirection === "up" ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{kpi.hint}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-6">
          <SectionHeader
            title="Performance des ventes"
            subtitle="Comparatif quotidien et progression de l'objectif"
          />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <LineChart
                data={analyticsSeriesState}
                className="h-56"
                stroke="hsl(var(--foreground))"
              />
            </div>
            <div className="space-y-6">
              {orderPipelineState.map((step) => (
                <div key={step.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{step.label}</span>
                    <span className="font-semibold text-foreground">{step.value}</span>
                  </div>
                  <Progress
                    value={Math.min((step.value / 240) * 100, 100)}
                    barClass={step.color === "bg-teal-500" ? "bg-primary" : step.color}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Codes promo</p>
                <p className="text-xs text-muted-foreground">Utilisations (période courante)</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/promo-codes")}>
                Gérer
              </Button>
            </div>
            <LineChart data={promoUsageSeriesState} className="h-24" />
          </div>
        </Card>

        <Card className="space-y-6">
          <SectionHeader
            title="Alertes stock"
            subtitle="Produits sous seuil"
          />
          <div className="space-y-4">
            {lowStockState.map((item) => (
              <div key={item.sku} className="flex items-center justify-between group">
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku} • {item.supplier}</p>
                </div>
                <Badge label="Faible" />
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/inventory")}
          >
            Planifier un réappro
          </Button>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Dernières commandes"
            subtitle="Flux temps réel des ventes"
            rightSlot={
              <Button variant="outline" size="sm" onClick={() => navigate("/orders")}>
                Voir toutes
              </Button>
            }
          />
          <div className="mt-4">
            <Table>
              <THead>
                <TRow>
                  <TCell>Commande</TCell>
                  <TCell>Client</TCell>
                  <TCell>Canal</TCell>
                  <TCell>Montant</TCell>
                  <TCell>Statut</TCell>
                </TRow>
              </THead>
              <tbody>
                {recentOrdersState.map((order) => (
                  <TRow key={order.id}>
                    <TCell className="font-semibold text-foreground">{order.id}</TCell>
                    <TCell>{order.customer}</TCell>
                    <TCell>{order.channel}</TCell>
                    <TCell>{order.amount}</TCell>
                    <TCell>
                      <Badge label={order.status} />
                    </TCell>
                  </TRow>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card className="space-y-6">
          <SectionHeader title="Top produits" subtitle="Par revenu (7 jours)" />
          <div className="space-y-4">
            {topProductsState.map((product) => (
              <div key={product.name} className="flex items-center justify-between group">
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{product.revenue}</p>
                  <p className="text-xs text-emerald-600">{product.delta}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-6">
          <SectionHeader title="Activité équipe" subtitle="Actions récentes" />
          {teamProductivityState ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="text-xs text-muted-foreground">Tâches complétées</div>
                <div className="text-lg font-semibold text-foreground">{teamProductivityState.tasksCompleted}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="text-xs text-muted-foreground">Membres actifs</div>
                <div className="text-lg font-semibold text-foreground">{teamProductivityState.activeMembers}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="text-xs text-muted-foreground">Top performer</div>
                <div className="text-lg font-semibold text-foreground">{teamProductivityState.topPerformer || "-"}</div>
              </div>
            </div>
          ) : null}

          {Array.isArray(teamProductivityState?.performances) && teamProductivityState.performances.length ? (
            <div className="rounded-lg border border-border bg-muted/10 p-3">
              <div className="text-xs font-semibold text-foreground">Performances individuelles</div>
              <div className="mt-2 space-y-2">
                {teamProductivityState.performances.slice(0, 5).map((p) => (
                  <div key={p.actor} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{p.name || p.actor}</div>
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
            {(teamActivityState.length ? teamActivityState.slice(0, 6) : []).map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role} • {item.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
            {teamActivityState.length === 0 ? <div className="text-sm text-muted-foreground">Aucune activité récente.</div> : null}
          </div>
        </Card>

        <Card className="space-y-6">
          <SectionHeader title="Plan d'action" subtitle="Priorités commerciales" />
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border transition-colors hover:bg-muted">
              <p className="text-sm font-semibold text-foreground">Relancer panier abandonné</p>
              <p className="text-xs text-muted-foreground">Envoyer 3 campagnes ciblées</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border transition-colors hover:bg-muted">
              <p className="text-sm font-semibold text-foreground">Optimiser SLA livraison</p>
              <p className="text-xs text-muted-foreground">Prioriser 4 fournisseurs</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border transition-colors hover:bg-muted">
              <p className="text-sm font-semibold text-foreground">Nouveaux bundles</p>
              <p className="text-xs text-muted-foreground">Associer accessoire + premium</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/marketing")}
          >
            Ouvrir la roadmap
          </Button>
        </Card>
      </div>
    </div>

    <Modal
      isOpen={isReportOpen}
      onClose={() => setIsReportOpen(false)}
      title="Rapport - Vue d'ensemble"
      footer={
        <>
          <Button variant="outline" onClick={() => setIsReportOpen(false)}>
            Fermer
          </Button>
          <Button variant="outline" onClick={() => navigate("/analytics")}>
            Ouvrir Analytics
          </Button>
          <Button onClick={downloadReport}>
            Télécharger (JSON)
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Export rapide des données affichées dans la vue d'ensemble (utile pour un partage ou un audit).
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/60 p-3 bg-muted/20">
            <p className="text-xs text-muted-foreground">Dernière mise à jour</p>
            <p className="font-semibold text-foreground">
              {lastUpdatedAt ? lastUpdatedAt.toLocaleString("fr-FR") : "-"}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 p-3 bg-muted/20">
            <p className="text-xs text-muted-foreground">Commandes (liste)</p>
            <p className="font-semibold text-foreground">{recentOrdersState.length}</p>
          </div>
        </div>
      </div>
    </Modal>
    </>
  );
}
