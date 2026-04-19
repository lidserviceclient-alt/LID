import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import LineChart from "../components/charts/LineChart.jsx";
import Select from "../components/ui/Select.jsx";
import Button from "../components/ui/Button.jsx";
import { analyticsSeries as analyticsSeriesMock } from "../data/mockData.js";
import { useOverviewContext } from "../contexts/OverviewContext.jsx";
import { useNotificationsContext } from "../contexts/NotificationsContext.jsx";

const ranges = [
  { value: "week", label: "Cette semaine", days: 7 },
  { value: "month", label: "Ce mois", days: 30 },
  { value: "quarter", label: "Ce trimestre", days: 90 },
  { value: "year", label: "Cette année", days: 365 }
];

const sumSeries = (series) =>
  (Array.isArray(series) ? series : []).reduce((acc, v) => acc + (Number(v) || 0), 0);

const chunkSum = (series, size) => {
  const safe = Array.isArray(series) ? series : [];
  if (size <= 0) return safe.slice();
  const chunks = [];
  for (let i = 0; i < safe.length; i += size) {
    chunks.push(sumSeries(safe.slice(i, i + size)));
  }
  return chunks;
};

const aggregateDailyToLast12Months = (dailySeries) => {
  const safe = Array.isArray(dailySeries) ? dailySeries.map((v) => Number(v) || 0) : [];
  if (safe.length === 0) return [];

  const today = new Date();
  const keys = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${d.getMonth()}`);
  }

  const totals = Object.fromEntries(keys.map((key) => [key, 0]));
  const start = new Date(today);
  start.setDate(today.getDate() - (safe.length - 1));

  for (let i = 0; i < safe.length; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key in totals) {
      totals[key] += safe[i];
    }
  }

  return keys.map((key) => totals[key] || 0);
};

export default function Analytics() {
  const [range, setRange] = useState("week");
  const { getOverviewEntry, loadOverview } = useOverviewContext();
  const {
    notifications,
    notificationsLoading,
    notificationsError,
    unreadNotificationsCount,
    loadNotifications
  } = useNotificationsContext();

  const selected = useMemo(
    () => ranges.find((item) => item.value === range) || ranges[0],
    [range]
  );

  useEffect(() => {
    loadOverview(selected.days).catch(() => {});
  }, [loadOverview, selected.days]);

  const overviewEntry = getOverviewEntry(selected.days);
  const rawSeries = useMemo(() => {
    if (!Array.isArray(overviewEntry.data?.analyticsSeries)) return analyticsSeriesMock;
    return overviewEntry.data.analyticsSeries.map((v) => Number(v) || 0);
  }, [overviewEntry.data]);
  const isLoading = overviewEntry.loading;
  const error = overviewEntry.error;

  const chartSeries = useMemo(() => {
    const safe = Array.isArray(rawSeries) ? rawSeries.map((v) => Number(v) || 0) : [];
    if (range === "week") return safe.slice(-7);
    if (range === "month") return safe;
    if (range === "quarter") return chunkSum(safe, 7);
    if (range === "year") return aggregateDailyToLast12Months(safe);
    return safe;
  }, [rawSeries, range]);

  const trafficSubtitle = useMemo(() => {
    switch (range) {
      case "week":
        return "Évolution quotidienne (7 jours)";
      case "month":
        return "Évolution quotidienne (30 jours)";
      case "quarter":
        return "Évolution hebdomadaire (13 semaines)";
      case "year":
        return "Évolution mensuelle (12 mois)";
      default:
        return "Évolution";
    }
  }, [range]);

  const conversionSteps = useMemo(() => {
    const purchases = sumSeries(rawSeries);
    const checkout = purchases ? Math.max(Math.round(purchases / 0.52), purchases) : 0;
    const addToCart = checkout ? Math.max(Math.round(checkout / 0.62), checkout) : 0;
    const visitors = addToCart ? Math.max(Math.round(addToCart / 0.13), addToCart) : 0;

    const steps = [
      { label: "Visiteurs", value: visitors },
      { label: "Ajouts panier", value: addToCart },
      { label: "Checkout", value: checkout },
      { label: "Achats", value: purchases }
    ];

    return steps.map((step, index) => {
      const prev = steps[index - 1]?.value || 0;
      const drop = index === 0 || prev <= 0 ? 0 : Math.max(0, Math.round((1 - step.value / prev) * 100));
      return {
        ...step,
        formatted: new Intl.NumberFormat("fr-FR").format(step.value),
        drop
      };
    });
  }, [rawSeries]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analytics"
        subtitle="Analysez la performance et la conversion."
        titleClassName="text-4xl"
        rightSlot={
          <div className="w-40">
            <Select value={range} onChange={(e) => setRange(e.target.value)}>
              {ranges.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-3 p-6 space-y-4">
          <SectionHeader title="Trafic & revenus" subtitle={trafficSubtitle} />
          {error && <div className="text-sm text-destructive">{error}</div>}
          <LineChart
            data={chartSeries}
            className={`h-64 ${isLoading ? "opacity-60 animate-pulse" : ""}`}
            stroke="hsl(var(--foreground))"
          />
        </Card>

      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 space-y-3">
          <SectionHeader title="Conversion" subtitle="Tunnel hebdo" />
          {conversionSteps.map((step) => (
            <div key={step.label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{step.label}</span>
              <span className="text-sm font-semibold text-foreground">{step.formatted}</span>
              <span className="text-xs text-muted-foreground">-{step.drop}%</span>
            </div>
          ))}
        </Card>

        <Card className="p-6 space-y-3">
          <SectionHeader title="Cohortes" subtitle="Rétention clients" />
          <div className="grid grid-cols-4 gap-2 text-xs">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-10 rounded-lg bg-primary/20"
                style={{ opacity: 0.15 + idx * 0.08 }}
              />
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <SectionHeader title="Notifications" subtitle={`${unreadNotificationsCount} non lue(s)`} />
          {notificationsError && (
            <div className="text-sm text-destructive">
              {notificationsError}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => loadNotifications().catch(() => {})}
              disabled={notificationsLoading}
            >
              {notificationsLoading ? "Chargement..." : "Charger"}
            </Button>
          </div>
          {Array.isArray(notifications) && notifications.length > 0 ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id || `${n.type}-${n.createdAt}`} className="space-y-0.5">
                  <p className="text-sm text-foreground font-medium">{n.title || "Notification"}</p>
                  <p className="text-xs text-muted-foreground">{n.body || ""}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune notification récente.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
