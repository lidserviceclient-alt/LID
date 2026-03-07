import { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ChevronDown, 
  Eye, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Calendar,
  User,
  CreditCard,
  Package,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from "react-qr-code";
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import Receipt from '../../components/Receipt';

const MOCK_ORDERS = [
  { 
    id: "#ORD-7829", 
    customer: { name: "Thomas D.", email: "thomas.d@example.com", avatar: "https://i.pravatar.cc/150?u=thomas" },
    items: [
      { name: "Nike Air Max 90", quantity: 1, price: 129.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80" }
    ],
    total: 129.99, 
    status: "Completed", 
    date: "2024-03-10",
    payment: "Carte Bancaire"
  },
  { 
    id: "#ORD-7828", 
    customer: { name: "Sarah M.", email: "sarah.m@example.com", avatar: "https://i.pravatar.cc/150?u=sarah" },
    items: [
      { name: "Premium Cotton T-Shirt", quantity: 2, price: 29.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=100&q=80" }
    ],
    total: 59.98, 
    status: "Processing", 
    date: "2024-03-10",
    payment: "PayPal"
  },
  { 
    id: "#ORD-7827", 
    customer: { name: "Jean P.", email: "jean.p@example.com", avatar: "https://i.pravatar.cc/150?u=jean" },
    items: [
      { name: "Wireless Headphones", quantity: 1, price: 199.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80" }
    ],
    total: 199.99, 
    status: "Pending", 
    date: "2024-03-09",
    payment: "Orange Money"
  },
  { 
    id: "#ORD-7826", 
    customer: { name: "Marie L.", email: "marie.l@example.com", avatar: "https://i.pravatar.cc/150?u=marie" },
    items: [
      { name: "Running Shoes", quantity: 1, price: 89.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80" }
    ],
    total: 89.99, 
    status: "Cancelled", 
    date: "2024-03-08",
    payment: "Carte Bancaire"
  },
];

const STATUS_CONFIG = {
  'Completed': { label: 'Livré', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  'Processing': { label: 'En cours', icon: Truck, color: 'bg-blue-100 text-blue-700' },
  'Pending': { label: 'En attente', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  'Cancelled': { label: 'Annulé', icon: XCircle, color: 'bg-red-100 text-red-700' },
};

export default function Orders() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Create a ref for the component to be printed
  const componentRef = useRef();

  // Handle printing
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: selectedOrder ? `Recu-${selectedOrder.id}` : 'Recu',
  });

  const handleSimulateScan = () => {
    if (selectedOrder) {
      // Simulate API call and state update
      const updatedOrders = orders.map(o => 
        o.id === selectedOrder.id ? { ...o, status: 'Completed' } : o
      );
      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, status: 'Completed' });
      alert("QR Code scanné avec succès ! Commande marquée comme Livrée.");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-500 text-sm mt-1">Suivez et gérez vos ventes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
            Total: {orders.length} commandes
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Rechercher par ID ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Processing', 'Completed', 'Pending', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status 
                  ? 'bg-black text-white shadow-lg shadow-black/20' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'All' ? 'Tout' : STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
          <div className="col-span-2">Commande</div>
          <div className="col-span-3">Client</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Montant</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const StatusIcon = STATUS_CONFIG[order.status].icon;
              return (
                <motion.div 
                  key={order.id}
                  layoutId={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`group flex flex-col md:grid md:grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors items-center cursor-pointer border-l-4 ${order.status === 'Completed' ? 'border-green-500 bg-green-50/20' : 'border-transparent'}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="col-span-2 font-medium text-gray-900 flex items-center gap-2">
                    {order.status === 'Completed' && <CheckCircle2 size={16} className="text-green-500" />}
                    {order.id}
                  </div>
                  
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      <img src={order.customer.avatar} alt={order.customer.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{order.customer.name}</p>
                      <p className="text-xs text-gray-500 truncate">{order.customer.email}</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    {order.date}
                  </div>

                  <div className="col-span-2 font-bold text-gray-900">
                    {order.total.toFixed(2)} FCFA
                  </div>

                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[order.status].color}`}>
                      <StatusIcon size={12} />
                      {STATUS_CONFIG[order.status].label}
                    </span>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>Aucune commande trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Détails Commande</h2>
                  <p className="text-sm text-gray-500">{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-900"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status Card */}
                <div className={`p-4 rounded-xl border ${STATUS_CONFIG[selectedOrder.status].color.replace('text', 'border').replace('bg', 'bg-opacity-10')} bg-opacity-50`}>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const StatusIcon = STATUS_CONFIG[selectedOrder.status].icon;
                      return <StatusIcon size={24} />;
                    })()}
                    <div>
                      <p className="font-bold">Commande {STATUS_CONFIG[selectedOrder.status].label}</p>
                      <p className="text-xs opacity-80">Mise à jour le {selectedOrder.date}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Package size={16} /> Produits
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                        </div>
                        <div className="font-bold text-gray-900">
                          {(item.price * item.quantity).toFixed(2)} FCFA
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Delivery QR Code */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <QrCode size={16} /> QR Code Livraison
                  </h3>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-2">
                    <div style={{ height: "auto", margin: "0 auto", maxWidth: 128, width: "100%" }} onClick={handleSimulateScan} className="cursor-pointer hover:opacity-80 transition-opacity">
                        <QRCode
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            value={`LID-ORDER-${selectedOrder.id}`}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      À scanner par le livreur lors de la récupération (Cliquez pour simuler)
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User size={16} /> Client
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white overflow-hidden border border-gray-200">
                        <img src={selectedOrder.customer.avatar} alt={selectedOrder.customer.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedOrder.customer.name}</p>
                        <p className="text-sm text-gray-500">{selectedOrder.customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
                      <CreditCard size={14} />
                      Payé via {selectedOrder.payment}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-4 text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{selectedOrder.total.toFixed(2)} FCFA</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handlePrint()}
                    className="px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm"
                  >
                    Télécharger Facture
                  </button>
                  <button className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 font-medium text-sm">
                    Mettre à jour Statut
                  </button>
                </div>
                
                {/* Hidden Receipt Component for Printing */}
                <div className="hidden">
                  <div ref={componentRef}>
                    <Receipt order={selectedOrder} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
