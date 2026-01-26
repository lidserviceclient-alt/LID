import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { logisticsData } from "../data/mockData.js";

export default function Logistics() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Logistique & Livraison"
        subtitle="Suivi des expéditions et performance transporteurs."
        rightSlot={<Button>Configurer transporteurs</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Colis en transit</p>
          <p className="text-2xl font-bold text-foreground">124</p>
          <p className="text-xs text-muted-foreground text-green-600">Tout est fluide</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Délai moyen</p>
          <p className="text-2xl font-bold text-foreground">1.8 jours</p>
          <p className="text-xs text-muted-foreground text-green-600">-0.2j vs mois dernier</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Coût moyen</p>
          <p className="text-2xl font-bold text-foreground">2 450 FCFA</p>
          <p className="text-xs text-muted-foreground">Stable</p>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Suivi des expéditions" subtitle="Derniers statuts reçus" />
        <Table>
          <THead>
            <TRow>
              <TCell>Tracking ID</TCell>
              <TCell>Commande</TCell>
              <TCell>Transporteur</TCell>
              <TCell>Statut</TCell>
              <TCell>ETA</TCell>
              <TCell>Coût</TCell>
            </TRow>
          </THead>
          <tbody>
            {logisticsData.map((item) => (
              <TRow key={item.id}>
                <TCell className="font-mono text-xs font-semibold">{item.id}</TCell>
                <TCell>{item.order}</TCell>
                <TCell>{item.carrier}</TCell>
                <TCell><Badge label={item.status} /></TCell>
                <TCell>{item.eta}</TCell>
                <TCell>{item.cost} FCFA</TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
