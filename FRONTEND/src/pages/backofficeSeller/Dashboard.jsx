import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Package, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';

const STATS = [
  { 
    label: "Ventes Totales", 
    value: "12,450.00 Fcfa", 
    change: "+12.5%", 
    trend: "up", 
    icon: DollarSign,
    color: "bg-green-100 text-green-600"
  },
  { 
    label: "Commandes", 
    value: "156", 
    change: "+8.2%", 
    trend: "up", 
    icon: ShoppingBag,
    color: "bg-blue-100 text-blue-600"
  },
  { 
    label: "Produits Vendus", 
    value: "432", 
    change: "-2.4%", 
    trend: "down", 
    icon: Package,
    color: "bg-purple-100 text-purple-600"
  },
  { 
    label: "Panier Moyen", 
    value: "79.80 Fcfa", 
    change: "+4.1%", 
    trend: "up", 
    icon: TrendingUp,
    color: "bg-orange-100 text-orange-600"
  }
];

const STOCK_ALERTS = [
  { name: "Wireless Headphones", stock: 2, status: "critical" },
  { name: "Sport Bag", stock: 5, status: "low" },
];

const RECENT_ORDERS = [
  { id: "#ORD-7829", customer: "Thomas D.", product: "Nike Air Max 90", amount: "129.99 €", status: "Completed", date: "Il y a 2 min" },
  { id: "#ORD-7828", customer: "Sarah M.", product: "Premium Cotton T-Shirt", amount: "29.99 €", status: "Processing", date: "Il y a 15 min" },
  { id: "#ORD-7827", customer: "Jean P.", product: "Wireless Headphones", amount: "199.99 €", status: "Completed", date: "Il y a 1h" },
  { id: "#ORD-7826", customer: "Marie L.", product: "Running Shoes", amount: "89.99 €", status: "Cancelled", date: "Il y a 3h" },
  { id: "#ORD-7825", customer: "Pierre K.", product: "Sport Bag", amount: "45.00 €", status: "Completed", date: "Il y a 5h" },
];

const TOP_PRODUCTS = [
  { name: "Nike Air Max 90", sales: 45, revenue: "5,849.55 €", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80" },
  { name: "Wireless Headphones", sales: 28, revenue: "5,599.72 €", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80" },
  { name: "Premium Cotton T-Shirt", sales: 124, revenue: "3,718.76 €", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=100&q=80" },
];

const WEEKLY_SALES = [
  { day: "Lun", value: 45 },
  { day: "Mar", value: 32 },
  { day: "Mer", value: 78 },
  { day: "Jeu", value: 56 },
  { day: "Ven", value: 89 },
  { day: "Sam", value: 102 },
  { day: "Dim", value: 65 },
];

export default function Dashboard() {
  const navigate = useNavigate()
  return (
    <div className="space-y-8 p-2 max-w-7xl mx-auto">
      {/* Header */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, index) => (
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
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inventory Alerts Section */}
      {STOCK_ALERTS.length > 0 && (
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
            {STOCK_ALERTS.map((alert, index) => (
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
        {/* Main Chart Section (Simulated) */}
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
            {WEEKLY_SALES.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full">
                <div className="w-full flex-1 relative flex items-end bg-gray-50 rounded-lg overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${item.value}%` }}
                    transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                    className="w-full bg-green-700/70 group-hover:bg-black/80 rounded-t-sm transition-colors relative mx-auto"
                    style={{ width: '60%' }}
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                      {item.value * 10} FCFA
                    </div>
                  </motion.div>
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-gray-900 transition-colors">{item.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Produits</h3>
          <div className="space-y-6">
            {TOP_PRODUCTS.map((product, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h4>
                  <p className="text-xs text-gray-500">{product.sales} ventes</p>
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

      {/* Recent Orders Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Commandes Récentes</h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Voir tout</button>
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
              {RECENT_ORDERS.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-600">{order.product}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'Completed' ? 'Complété' : 
                       order.status === 'Processing' ? 'En cours' : 'Annulé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
