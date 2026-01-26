import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { financeTransactions } from "../data/mockData.js";

export default function Finance() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Finance"
        subtitle="Suivi de la trésorerie, paiements et réconciliations."
        rightSlot={<Button>Exporter rapport</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="space-y-2 bg-primary/5 border-primary/20">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Solde Disponible</p>
          <p className="text-2xl font-bold text-foreground">4 280 000 F</p>
          <p className="text-xs text-muted-foreground">Mis à jour à l'instant</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Encaissements (M)</p>
          <p className="text-2xl font-bold text-green-600">+12.4 M</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Décaissements (M)</p>
          <p className="text-2xl font-bold text-red-600">-8.2 M</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">En attente</p>
          <p className="text-2xl font-bold text-amber-600">450 000 F</p>
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
            {financeTransactions.map((tx) => (
              <TRow key={tx.id}>
                <TCell className="font-mono text-xs">{tx.id}</TCell>
                <TCell>{tx.type}</TCell>
                <TCell>{tx.method}</TCell>
                <TCell className={tx.amount.startsWith('+') ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {tx.amount} FCFA
                </TCell>
                <TCell><Badge label={tx.status} variant={tx.status === 'Succes' ? 'success' : 'warning'} /></TCell>
                <TCell>{tx.date}</TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
