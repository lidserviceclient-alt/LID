import ShippingLabel from "../components/ShippingLabel.jsx";

export default function TestLabel() {
  const order = {
    id: "INV-2026-00452",
    createdAt: new Date(),
    shippingAddress: "Cocody Riviera 3, Immeuble ABC, Abidjan, Côte d'Ivoire",
    trackingId: "LD8473334713CI",
    weight: "1.4 kg",
    carrier: "Express 24H"
  };

  const customer = {
    name: "Jean Dupont",
    phone: "+225 05 11 22 33 44"
  };

  const company = {
    storeName: "Life Distribution",
    city: "Cocody, Abidjan",
    contactPhone: "+225 07 00 00 00 00",
    country: "Côte d'Ivoire"
  };

  return (
    <ShippingLabel
      order={order}
      customer={customer}
      company={company}
    />
  );
}