import {
  kpiData,
  orderPipeline,
  recentOrders,
  lowStock,
  topProducts,
  analyticsSeries,
  teamActivity
} from "../data/mockData.js";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Progress from "../components/ui/Progress.jsx";
import Sparkline from "../components/charts/Sparkline.jsx";
import BarChart from "../components/charts/BarChart.jsx";
import Button from "../components/ui/Button.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble des opérations et de la performance."
        rightSlot={
          <>
            <Button variant="outline">Synchroniser</Button>
            <Button>Planifier un rapport</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiData.map((kpi) => (
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
                  data={analyticsSeries}
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
              <BarChart data={analyticsSeries} barClassName="bg-primary" />
            </div>
            <div className="space-y-6">
              {orderPipeline.map((step) => (
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
        </Card>

        <Card className="space-y-6">
          <SectionHeader
            title="Alertes stock"
            subtitle="Produits sous seuil"
          />
          <div className="space-y-4">
            {lowStock.map((item) => (
              <div key={item.sku} className="flex items-center justify-between group">
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku} • {item.supplier}</p>
                </div>
                <Badge label="Faible" />
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full">Planifier un réappro</Button>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Dernières commandes"
            subtitle="Flux temps réel des ventes"
            rightSlot={<Button variant="outline" size="sm">Voir toutes</Button>}
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
                {recentOrders.map((order) => (
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
            {topProducts.map((product) => (
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
          <div className="space-y-4">
            {teamActivity.map((item) => (
              <div key={item.name} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role} • {item.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
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
          <Button variant="outline" className="w-full">Ouvrir la roadmap</Button>
        </Card>
      </div>
    </div>
  );
}