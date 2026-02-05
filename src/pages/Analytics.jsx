import { useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import LineChart from "../components/charts/LineChart.jsx";
import Select from "../components/ui/Select.jsx";
import { analyticsSeries as analyticsSeriesMock, channelMix } from "../data/mockData.js";
import { backofficeApi } from "../services/api.js";

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
  const [rawSeries, setRawSeries] = useState(analyticsSeriesMock);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  const selected = useMemo(
    () => ranges.find((item) => item.value === range) || ranges[0],
    [range]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    setIsLoading(true);
    setError("");

    backofficeApi
      .overview(selected.days)
      .then((data) => {
        if (canceled || !mountedRef.current) return;
        if (Array.isArray(data?.analyticsSeries)) {
          setRawSeries(data.analyticsSeries.map((v) => Number(v) || 0));
        } else {
          setRawSeries(analyticsSeriesMock);
        }
      })
      .catch((err) => {
        if (canceled || !mountedRef.current) return;
        setError(err?.message || "Impossible de charger les analytics.");
        setRawSeries(analyticsSeriesMock);
      })
      .finally(() => {
        if (canceled || !mountedRef.current) return;
        setIsLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [selected.days]);

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
    const purchaseRate = 0.52;
    const checkoutRate = 0.62;
    const addToCartRate = 0.13;

    const checkout = purchases ? Math.max(Math.round(purchases / purchaseRate), purchases) : 0;
    const addToCart = checkout ? Math.max(Math.round(checkout / checkoutRate), checkout) : 0;
    const visitors = addToCart ? Math.max(Math.round(addToCart / addToCartRate), addToCart) : 0;

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
        subtitle="Analysez vos canaux et la conversion."
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
        <Card className="lg:col-span-2 p-6 space-y-4">
          <SectionHeader title="Trafic & revenus" subtitle={trafficSubtitle} />
          {error && <div className="text-sm text-destructive">{error}</div>}
          <LineChart
            data={chartSeries}
            className={`h-64 ${isLoading ? "opacity-60 animate-pulse" : ""}`}
            stroke="hsl(var(--foreground))"
          />
        </Card>

        <Card className="p-6 space-y-4">
          <SectionHeader title="Mix canaux" subtitle="Part du CA" />
          <div className="space-y-4">
            {channelMix.map((channel) => (
              <div key={channel.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{channel.label}</span>
                  <span className="text-muted-foreground">{channel.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full"
                    style={{ background: channel.color, width: `${channel.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
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
          <SectionHeader title="Alertes" subtitle="Opportunités" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>+9% de conversion sur Mobile Money cette semaine.</p>
            <p>Les paniers abandonnés ont augmenté de 3%.</p>
            <p>Les campagnes TikTok génèrent un CPA 18% plus bas.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
