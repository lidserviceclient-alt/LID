import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { usePartnerBackofficeBootstrap } from '@/features/partnerBackoffice/PartnerBackofficeBootstrapContext';

const STATUS_LABEL = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "En cours",
  READY_TO_DELIVER: "Prête",
  DELIVERY_IN_PROGRESS: "En livraison",
  DELIVERED: "Livrée",
  CANCELED: "Annulée",
  REFUNDED: "Remboursée",
};

const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function Dashboard() {
  const navigate = useNavigate();
  const bootstrap = usePartnerBackofficeBootstrap();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockThreshold, setStockThreshold] = useState(5);

  useEffect(() => {
    if (bootstrap?.routeKey !== 'dashboard') {
      return;
    }
    if (!bootstrap?.isResolved) {
      setLoading(true);
      return;
    }
    if (!bootstrap?.data) {
      setStats({ products: 0, orders: 0, customers: 0, revenue: 0 });
      setOrders([]);
      setProducts([]);
      setStockThreshold(5);
      setLoading(false);
      return;
    }

    const collection = bootstrap.data?.collection || {};
    const prefsRes = bootstrap.settingsCollection?.preferences || {};
    const statsRes = collection?.stats;
    const ordersRes = Array.isArray(collection?.orders) ? collection.orders : [];
    const productsRes = Array.isArray(collection?.products) ? collection.products : [];
    setStats({
      products: Number(statsRes?.products || 0),
      orders: Number(statsRes?.orders || 0),
      customers: Number(statsRes?.customers || 0),
      revenue: Number(statsRes?.revenue || 0),
    });
    setOrders(ordersRes);
    setProducts(productsRes);
    setStockThreshold(Number(prefsRes?.stockThreshold || 5));
    setLoading(false);
  }, [bootstrap]);

  const avgBasket = useMemo(() => (stats.orders > 0 ? stats.revenue / stats.orders : 0), [stats.orders, stats.revenue]);

  const cards = useMemo(() => ([
    { label: "Ventes Totales", value: `${stats.revenue.toFixed(2)} FCFA`, icon: DollarSign, color: "bg-green-100 text-green-600" },
    { label: "Commandes", value: `${stats.orders}`, icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
    { label: "Produits", value: `${stats.products}`, icon: Package, color: "bg-purple-100 text-purple-600" },
    { label: "Panier Moyen", value: `${avgBasket.toFixed(2)} FCFA`, icon: TrendingUp, color: "bg-orange-100 text-orange-600" },
  ]), [avgBasket, stats.orders, stats.products, stats.revenue]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 5).map((o) => ({
      id: `#ORD-${o.id}`,
      customer: o.customerName || "Client",
      product: "-",
      amount: `${Number(o.amount || 0).toFixed(2)} FCFA`,
      status: STATUS_LABEL[o.status] || o.status || "En attente",
      statusRaw: o.status || "PENDING",
      date: o.createdAt ? new Date(o.createdAt).toLocaleString("fr-FR") : "",
    }));
  }, [orders]);

  const weeklySales = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const monday = new Date(now);
    const day = monday.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    orders.forEach((o) => {
      if (!o?.createdAt) return;
      const d = new Date(o.createdAt);
      const delta = Math.floor((d - monday) / (1000 * 60 * 60 * 24));
      if (delta >= 0 && delta < 7) counts[delta] += Number(o.amount || 0);
    });
    const max = Math.max(...counts, 1);
    return WEEK_DAYS.map((label, idx) => ({
      day: label,
      value: Math.round((counts[idx] / max) * 100),
      raw: counts[idx],
    }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const data = products.map((p) => {
      const stock = Number(p.stock || 0);
      const price = Number(p.price || 0);
      return {
        name: p.name || "Produit",
        sales: stock,
        revenue: `${(stock * price).toFixed(2)} FCFA`,
        image: p.imageUrl || p.img || "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=100&q=80",
      };
    });
    return data.sort((a, b) => b.sales - a.sales).slice(0, 3);
  }, [products]);

  const stockAlerts = useMemo(() => {
    return products
      .filter((p) => Number(p.stock || 0) <= stockThreshold)
      .slice(0, 6)
      .map((p) => ({
        name: p.name || "Produit",
        stock: Number(p.stock || 0),
        status: Number(p.stock || 0) === 0 ? "critical" : "low",
      }));
  }, [products, stockThreshold]);

  return (
    <div className="space-y-8 p-2 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Aperçu de vos performances aujourd'hui</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <Clock size={16} className="text-gray-400" />
          <span className="text-gray-600">Dernière mise à jour: <span className="font-medium text-gray-900">À l'instant</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                {loading ? "..." : "Live"}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {stockAlerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-50 border border-red-100 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-600" size={24} />
            <h3 className="text-lg font-bold text-red-900">Alertes Stock</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockAlerts.map((alert, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-red-100 flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-medium text-gray-900">{alert.name}</h4>
                  <p className="text-sm text-red-600 font-medium">
                    {alert.stock === 0 ? "Rupture de stock" : `Plus que ${alert.stock} en stock`}
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/sel-off/products')}
                  className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors"
                >
                  Gérer
                </button>
              </div>
            ))}
            <div className="bg-white/50 p-4 rounded-xl border border-dashed border-red-200 flex items-center justify-center text-red-400 text-sm">
              Tout le reste du stock est bon
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-900">Aperçu des ventes</h3>
            <select className="text-sm border-none bg-gray-50 rounded-lg px-3 py-1.5 focus:ring-0 text-gray-600 font-medium">
              <option>Cette semaine</option>
              <option>Ce mois</option>
              <option>Cette année</option>
            </select>
          </div>
          
          <div className="h-64 flex items-stretch justify-between gap-2 sm:gap-4">
            {weeklySales.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full">
                <div className="w-full flex-1 relative flex items-end bg-gray-50 rounded-lg overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${item.value}%` }}
                    transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                    className="w-full bg-green-700/70 group-hover:bg-black/80 rounded-t-sm transition-colors relative mx-auto"
                    style={{ width: '60%' }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                      {item.raw.toFixed(2)} FCFA
                    </div>
                  </motion.div>
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-gray-900 transition-colors">{item.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Produits</h3>
          <div className="space-y-6">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h4>
                  <p className="text-xs text-gray-500">{product.sales} en stock</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{product.revenue}</p>
                </div>
              </div>
            ))}
            <button 
              onClick={()=>navigate('/sel-off/products')}
              className="w-full py-3 text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 rounded-xl transition-all border border-dashed border-gray-200 hover:border-gray-300">
              Voir tous les produits
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Commandes Récentes</h3>
          <button onClick={() => navigate('/sel-off/orders')} className="text-sm font-medium text-blue-600 hover:text-blue-700">Voir tout</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Commande</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-600">{order.product}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.statusRaw === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      ['PROCESSING', 'READY_TO_DELIVER', 'DELIVERY_IN_PROGRESS'].includes(order.statusRaw) ? 'bg-blue-100 text-blue-800' :
                      order.statusRaw === 'CANCELED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">{order.date}</td>
                </tr>
              ))}
              {!loading && recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Aucune commande pour le moment</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
