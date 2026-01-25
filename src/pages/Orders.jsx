import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { orderTable } from "../data/mockData.js";

export default function Orders() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Commandes"
        subtitle="Suivez, priorisez et automatisez vos flux logistiques."
        rightSlot={
          <>
            <Button variant="outline">Filtrer</Button>
            <Button>Nouvelle commande</Button>
          </>
        }
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {["Toutes", "Nouvelles", "En préparation", "Expédiées", "Livrées", "Retours"].map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 rounded-full text-xs font-semibold border border-input text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {tag}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <input
              className="border border-input bg-background rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Rechercher une commande"
            />
            <Button variant="outline">Exporter</Button>
          </div>
        </div>

        <Table>
          <THead>
            <TRow>
              <TCell>Commande</TCell>
              <TCell>Client</TCell>
              <TCell>Articles</TCell>
              <TCell>Canal</TCell>
              <TCell>Total</TCell>
              <TCell>Statut</TCell>
              <TCell>Date</TCell>
            </TRow>
          </THead>
          <tbody>
            {orderTable.map((order) => (
              <TRow key={order.id}>
                <TCell className="font-semibold text-foreground">{order.id}</TCell>
                <TCell>{order.customer}</TCell>
                <TCell>{order.items}</TCell>
                <TCell>{order.channel}</TCell>
                <TCell>{order.total}</TCell>
                <TCell>
                  <Badge label={order.status} />
                </TCell>
                <TCell>{order.date}</TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}