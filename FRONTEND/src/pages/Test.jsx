import Receipt from '../components/Receipt.jsx';

export default function Test() {
  const order = {
    id: "CMD-8839-XJ",
    date: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    customer: {
      name: "Jean Dupont",
      email: "jean.dupont@email.com",
      phone: "+225 07 07 07 07 07",
      address: "Cocody Riviera 2, Abidjan"
    },
    store: {
      name: "LID Market",
      address: "Siège Social, Abidjan, Côte d'Ivoire",
      phone: "+225 01 02 03 04 05",
      email: "contact@lid-market.com",
      website: "www.lid-market.com"
    },
    items: [
      {
        name: "Nike Air Max 90",
        variant: "Taille 42 - Noir",
        price: 85000,
        qty: 1,
      },
      {
        name: "T-shirt Cotton Premium",
        variant: "Taille L - Blanc",
        price: 15000,
        qty: 2,
      },
      {
        name: "Chaussettes Sport",
        variant: "Pack de 3",
        price: 5000,
        qty: 1,
      }
    ],
    subtotal: 120000,
    shipping: 2000,
    tax: 0,
    total: 122000,
    paymentMethod: "Orange Money",
    paymentStatus: "Payé",
    transactionId: "TXN-77382920"
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <Receipt order={order} />
    </div>
  );
}