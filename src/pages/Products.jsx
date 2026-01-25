import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { products } from "../data/mockData.js";

export default function Products() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Catalogue produits"
        subtitle="Pilotez les prix, le stock et la mise en avant."
        rightSlot={
          <>
            <Button variant="outline">Importer</Button>
            <Button>Ajouter un produit</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">SKU actifs</p>
          <p className="text-2xl font-bold text-foreground">1 284</p>
          <p className="text-xs text-muted-foreground">+32 ce mois</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Prix moyen</p>
          <p className="text-2xl font-bold text-foreground">64 000 FCFA</p>
          <p className="text-xs text-muted-foreground">Optimisé par segment</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Produits promo</p>
          <p className="text-2xl font-bold text-foreground">18%</p>
          <p className="text-xs text-muted-foreground">Campagne Janv.</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            className="border border-input bg-background rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Rechercher un produit"
          />
          <select className="border border-input bg-background rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option>Toutes catégories</option>
            <option>Chaussures</option>
            <option>Streetwear</option>
            <option>Accessoires</option>
          </select>
          <select className="border border-input bg-background rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option>Tous statuts</option>
            <option>Actif</option>
            <option>Faible</option>
          </select>
        </div>

        <Table>
          <THead>
            <TRow>
              <TCell>SKU</TCell>
              <TCell>Nom</TCell>
              <TCell>Catégorie</TCell>
              <TCell>Prix</TCell>
              <TCell>Stock</TCell>
              <TCell>Statut</TCell>
            </TRow>
          </THead>
          <tbody>
            {products.map((product) => (
              <TRow key={product.id}>
                <TCell className="font-semibold text-foreground">{product.id}</TCell>
                <TCell>{product.name}</TCell>
                <TCell>{product.category}</TCell>
                <TCell>{product.price}</TCell>
                <TCell>{product.stock}</TCell>
                <TCell><Badge label={product.status} /></TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}