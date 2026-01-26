import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { loyaltyTiers } from "../data/mockData.js";

export default function Loyalty() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Fidélité & Récompenses"
        subtitle="Gérez les niveaux VIP et l'engagement client."
        rightSlot={<Button>Configurer règles</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Membres VIP</p>
          <p className="text-2xl font-bold text-foreground">1 767</p>
          <p className="text-xs text-muted-foreground">+12% vs mois dernier</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Points distribués</p>
          <p className="text-2xl font-bold text-foreground">1.2 M</p>
          <p className="text-xs text-muted-foreground">Valeur ~ 120 000 FCFA</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Taux de rétention</p>
          <p className="text-2xl font-bold text-foreground">68%</p>
          <p className="text-xs text-muted-foreground text-green-600">Excellent</p>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Niveaux de fidélité" subtitle="Structure actuelle" />
        <Table>
          <THead>
            <TRow>
              <TCell>Niveau</TCell>
              <TCell>Points requis</TCell>
              <TCell>Membres actifs</TCell>
              <TCell>Avantages</TCell>
              <TCell>Action</TCell>
            </TRow>
          </THead>
          <tbody>
            {loyaltyTiers.map((tier) => (
              <TRow key={tier.name}>
                <TCell>
                  <Badge 
                    label={tier.name} 
                    variant={tier.name === 'Platinum' ? 'neutral' : tier.name === 'Gold' ? 'warning' : 'neutral'} 
                    className={tier.name === 'Platinum' ? 'bg-slate-800 text-white' : tier.name === 'Gold' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                  />
                </TCell>
                <TCell className="font-mono">{tier.minPoints} pts</TCell>
                <TCell>{tier.members}</TCell>
                <TCell className="text-sm">{tier.benefits}</TCell>
                <TCell>
                  <Button size="sm" variant="outline" className="h-7 text-xs">Éditer</Button>
                </TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
