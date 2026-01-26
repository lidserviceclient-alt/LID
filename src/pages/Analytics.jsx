import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import BarChart from "../components/charts/BarChart.jsx";
import Select from "../components/ui/Select.jsx";
import { analyticsSeries, channelMix } from "../data/mockData.js";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analytics"
        subtitle="Analysez vos canaux et la conversion."
        rightSlot={
          <div className="w-40">
            <Select>
              <option>Cette semaine</option>
              <option>Ce mois</option>
              <option>Ce trimestre</option>
              <option>Cette année</option>
            </Select>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-4">
          <SectionHeader title="Trafic & revenus" subtitle="Évolution mensuelle" />
          <BarChart data={analyticsSeries} barClassName="bg-foreground" />
        </Card>

        <Card className="space-y-4">
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
        <Card className="space-y-3">
          <SectionHeader title="Conversion" subtitle="Tunnel hebdo" />
          {[
            { label: "Visiteurs", value: "48 200" },
            { label: "Ajouts panier", value: "6 180" },
            { label: "Checkout", value: "3 840" },
            { label: "Achats", value: "2 010" }
          ].map((step, index) => (
            <div key={step.label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{step.label}</span>
              <span className="text-sm font-semibold text-foreground">{step.value}</span>
              <span className="text-xs text-muted-foreground">-{index * 12}%</span>
            </div>
          ))}
        </Card>

        <Card className="space-y-3">
          <SectionHeader title="Cohortes" subtitle="Rétention clients" />
          <div className="grid grid-cols-4 gap-2 text-xs">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="h-10 rounded-lg bg-primary/20"
                style={{ opacity: 0.15 + idx * 0.08 }}
              />
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
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