import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Label from "../components/ui/Label.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { customers } from "../data/mockData.js";
import { backofficeApi } from "../services/api.js";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}`;
  return `${new Intl.NumberFormat("fr-FR").format(num)} FCFA`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR");
};

const getTier = (spent) => {
  const num = Number(spent);
  if (Number.isNaN(num)) return "Bronze";
  if (num >= 1000000) return "Platinum";
  if (num >= 600000) return "Gold";
  if (num >= 300000) return "Silver";
  return "Bronze";
};

export default function Customers() {
  const [customerList, setCustomerList] = useState(customers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    ville: "",
    pays: ""
  });

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setIsModalOpen(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("create");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    backofficeApi
      .customers(0, 50)
      .then((data) => {
        if (data && Array.isArray(data.content)) {
          setCustomerList(
            data.content.map((customer) => ({
              id: customer.id,
              name: customer.name,
              tier: getTier(customer.spent),
              orders: customer.orders,
              spent: formatCurrency(customer.spent),
              lastOrder: formatDate(customer.lastOrder)
            }))
          );
        }
      })
      .catch(() => {
        // keep mock data
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const created = await backofficeApi.createCustomer(formData);
      setCustomerList((prev) => [
        {
          id: created.id,
          name: created.name,
          tier: getTier(created.spent),
          orders: created.orders,
          spent: formatCurrency(created.spent),
          lastOrder: formatDate(created.lastOrder)
        },
        ...prev
      ]);
      setIsModalOpen(false);
      setFormData({
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
        ville: "",
        pays: ""
      });
    } catch (err) {
      // keep modal open on error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Clients"
        subtitle="Fidélisez et segmentez vos meilleurs acheteurs."
        rightSlot={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un client
          </Button>
        }
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
            {customerList.map((customer) => (
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un client"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prenom</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Telephone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pays">Pays</Label>
            <Input
              id="pays"
              value={formData.pays}
              onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
