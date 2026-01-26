import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { customers } from "../data/mockData.js";

export default function Customers() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Clients"
        subtitle="Fidélisez et segmentez vos meilleurs acheteurs."
        rightSlot={<Button>Ajouter un client</Button>}
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="w-64">
            <Input
              placeholder="Rechercher un client"
            />
          </div>
          <div className="w-48">
            <Select>
              <option>Tous segments</option>
              <option>Gold</option>
              <option>Silver</option>
              <option>Bronze</option>
              <option>Platinum</option>
            </Select>
          </div>
        </div>

        <Table>
          <THead>
            <TRow>
              <TCell>Client</TCell>
              <TCell>Segment</TCell>
              <TCell>Commandes</TCell>
              <TCell>Dépense</TCell>
              <TCell>Dernière commande</TCell>
            </TRow>
          </THead>
          <tbody>
            {customers.map((customer) => (
              <TRow key={customer.id}>
                <TCell>
                  <div>
                    <p className="font-semibold text-foreground">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.id}</p>
                  </div>
                </TCell>
                <TCell><Badge label={customer.tier} /></TCell>
                <TCell>{customer.orders}</TCell>
                <TCell>{customer.spent}</TCell>
                <TCell>{customer.lastOrder}</TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}