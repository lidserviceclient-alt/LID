import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { inventoryData, lowStock } from "../data/mockData.js";

export default function Inventory() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Stocks"
        subtitle="Vision sur le stock, réapprovisionnement et entrepôts."
        rightSlot={
          <>
            <Button variant="outline">Inventaire</Button>
            <Button>Mouvement de stock</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-4">
          <SectionHeader title="Mouvements récents" subtitle="Historique des entrées/sorties" />
          
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div className="w-48">
              <Input placeholder="Rechercher SKU..." />
            </div>
            <div className="w-40">
              <Select>
                <option>Tous types</option>
                <option>Entrée</option>
                <option>Sortie</option>
              </Select>
            </div>
          </div>

          <Table>
            <THead>
              <TRow>
                <TCell>SKU</TCell>
                <TCell>Produit</TCell>
                <TCell>Type</TCell>
                <TCell>Qté</TCell>
                <TCell>Date</TCell>
              </TRow>
            </THead>
            <tbody>
              {inventoryData.map((item) => (
                <TRow key={item.id}>
                  <TCell className="font-mono text-xs">{item.sku}</TCell>
                  <TCell className="font-medium">{item.product}</TCell>
                  <TCell>
                    <Badge 
                      label={item.type} 
                      variant={item.type === 'Entree' ? 'success' : item.type === 'Sortie' ? 'warning' : 'neutral'} 
                    />
                  </TCell>
                  <TCell className={item.quantity > 0 ? "text-green-600" : "text-red-600"}>
                    {item.quantity > 0 ? "+" : ""}{item.quantity}
                  </TCell>
                  <TCell className="text-muted-foreground text-xs">{item.date}</TCell>
                </TRow>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Alertes stock" subtitle="Produits sous seuil critique" />
          <div className="space-y-4">
            {lowStock.map((item) => (
              <div key={item.sku} className="p-3 border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                  </div>
                  <Badge label="Critique" variant="danger" />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Stock: <strong className="text-foreground">{item.stock}</strong></span>
                  <span className="text-muted-foreground">Seuil: {item.threshold}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full h-8 text-xs">Commander</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
