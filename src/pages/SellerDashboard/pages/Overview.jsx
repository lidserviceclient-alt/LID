import { useEffect, useMemo, useState } from "react";
import { DollarSign, ShoppingBag, Users, Package, Clock } from "lucide-react";
import LineChart from "@/components/charts/LineChart";
import { fetchDailyTrafficSeries, fetchMonthlyTrafficSeries } from "@/services/traffic";

const chartRanges = [
  { value: "week", label: "Cette semaine", subtitle: "Évolution quotidienne (7 jours)" },
  { value: "month", label: "Ce mois", subtitle: "Évolution quotidienne (30 jours)" },
  { value: "quarter", label: "Ce trimestre", subtitle: "Évolution hebdomadaire (13 semaines)" },
  { value: "year", label: "Cette année", subtitle: "Évolution mensuelle (12 mois)" }
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

export default function Overview() {
  const [range, setRange] = useState("week");
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(
    () => chartRanges.find((item) => item.value === range) || chartRanges[0],
    [range]
  );

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError("");

    const load = async () => {
      try {
        if (selected.value === "year") {
          const monthly = await fetchMonthlyTrafficSeries({ months: 12 });
          if (mounted) setSeries(monthly);
          return;
        }

        const days = selected.value === "week" ? 7 : selected.value === "month" ? 30 : 90;
        const daily = await fetchDailyTrafficSeries({ days });
        const aggregated = selected.value === "quarter" ? chunkSum(daily, 7) : daily;
        if (mounted) setSeries(aggregated);
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Impossible de charger le trafic.");
          setSeries([]);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [selected.value]);

  const totalTraffic = useMemo(() => sumSeries(series), [series]);
  const formattedTotal = useMemo(
    () => new Intl.NumberFormat("fr-FR").format(totalTraffic),
    [totalTraffic]
  );

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Ventes Totales", value: "2.5M FCFA", icon: DollarSign, change: "+12%" },
          { label: "Commandes", value: "154", icon: ShoppingBag, change: "+8%" },
          { label: "Clients", value: "1,203", icon: Users, change: "+24%" },
          { label: "Produits", value: "45", icon: Package, change: "+2%" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-neutral-100 shadow-sm hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-neutral-50 group-hover:bg-[#6aa200]/10 transition-colors">
                <stat.icon className="text-neutral-500 group-hover:text-[#6aa200] transition-colors" size={24} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
            </div>
            <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts / Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Trafic & revenus</h3>
              <p className="text-sm text-neutral-500 font-medium">{selected.subtitle}</p>
              <p className="mt-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Total visites : <span className="text-neutral-900">{formattedTotal}</span>
              </p>
            </div>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm font-bold outline-none"
            >
              {chartRanges.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="mt-4 text-sm font-medium text-red-600">{error}</div>}

          <div className="mt-6 h-64">
            <LineChart
              data={series}
              className={`h-64 ${isLoading ? "opacity-60 animate-pulse" : ""}`}
              stroke="#6aa200"
            />
          </div>
        </div>

        <div className="bg-neutral-900 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="text-xl font-bold mb-6">Activité Récente</h3>
             <div className="space-y-6">
               {[1,2,3].map((_, i) => (
                 <div key={i} className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                     <Clock size={18} />
                   </div>
                   <div>
                     <div className="font-bold text-sm">Nouvelle commande #452</div>
                     <div className="text-xs text-white/40">Il y a 2 minutes</div>
                   </div>
                 </div>
               ))}
             </div>
             <button className="mt-8 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition">
               Voir tout
             </button>
           </div>
           
           {/* Decor */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#6aa200] rounded-full blur-[100px] opacity-20 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
