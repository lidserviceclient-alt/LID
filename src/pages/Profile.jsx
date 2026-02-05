import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut, 
  Heart,
  ChevronRight,
  Clock,
  Camera
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { getUserProfile, logout, getCurrentUserPayload } from '@/services/authService.js';
import { getCustomerOrders, getCustomerWishlist } from '@/services/customerService.js';
import { useWishlist } from '@/features/wishlist/WishlistContext';

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

const MOCK_ADDRESSES = [
  { id: 1, type: "Domicile", name: "Jean Dupont", address: "Cocody Rivera 2, Rue des Jardins", city: "Abidjan", phone: "+225 07...", default: true },
  { id: 2, type: "Bureau", name: "Jean Dupont - LID Corp", address: "Plateau, Immeuble Alpha", city: "Abidjan", phone: "+225 05...", default: false },
];

// --- Sub-Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, danger }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm group relative overflow-hidden",
      active 
        ? "bg-[#6aa200] text-white shadow-lg shadow-[#6aa200]/20" 
        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800",
      danger && "text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10"
    )}
  >
    <Icon size={18} className={cn("transition-transform group-hover:scale-110", active && "scale-110")} />
    <span className="relative z-10">{label}</span>
    {active && <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#6aa200] z-0" />}
  </button>
);

const OrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'delivered': return 'Livré';
      case 'processing': return 'En cours';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-neutral-100 bg-white hover:border-[#6aa200]/30 hover:shadow-md transition-all duration-300 gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
          <Package size={20} />
        </div>
        <div>
          <h4 className="font-bold text-neutral-900">{order.id}</h4>
          <p className="text-xs text-neutral-500">{order.date} • {order.items} article(s)</p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
        <span className="font-bold text-neutral-900">{order.total}</span>
        <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getStatusColor(order.status))}>
          {getStatusLabel(order.status)}
        </span>
        <button className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-[#6aa200] transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const AddressCard = ({ address }) => (
  <div className={cn(
    "p-5 rounded-2xl border transition-all duration-300 relative group cursor-pointer",
    address.default 
      ? "border-[#6aa200] bg-[#6aa200]/5" 
      : "border-neutral-200 bg-white hover:border-[#6aa200]/50"
  )}>
    {address.default && (
      <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-[#6aa200] bg-white px-2 py-1 rounded-full shadow-sm">
        Par défaut
      </span>
    )}
    <div className="flex items-center gap-3 mb-3">
      <div className={cn("p-2 rounded-full", address.default ? "bg-[#6aa200] text-white" : "bg-neutral-100 text-neutral-500")}>
        <MapPin size={16} />
      </div>
      <span className="font-bold text-neutral-900">{address.type}</span>
    </div>
    <div className="space-y-1 text-sm text-neutral-600">
      <p className="font-medium text-neutral-900">{address.name}</p>
      <p>{address.address}</p>
      <p>{address.city}</p>
      <p className="text-xs text-neutral-400 mt-2">{address.phone}</p>
    </div>
  </div>
);

// --- Sections ---

const formatOrderDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `${value}`;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
};

const formatMoney = (amount, currency = 'FCFA') => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return `— ${currency}`;
  return `${n.toLocaleString('fr-FR')} ${currency || 'FCFA'}`;
};

const mapOrderStatus = (status) => {
  switch (`${status || ''}`.toUpperCase()) {
    case 'DELIVERED':
      return 'delivered';
    case 'CANCELED':
      return 'cancelled';
    case 'PENDING':
    case 'PAID':
    case 'PROCESSING':
    case 'READY_TO_DELIVER':
    case 'DELIVERY_IN_PROGRESS':
      return 'processing';
    default:
      return 'processing';
  }
};

const countOrderItems = (items) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((acc, it) => acc + (Number(it?.quantity) || 0), 0);
};

const OverviewSection = ({ stats, recentOrders, onSeeAllOrders, loading }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[#6aa200] text-white p-6 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-3xl font-bold mb-1">{loading ? '—' : stats.inProgress}</div>
          <div className="text-xs font-medium uppercase tracking-wider opacity-80">Commandes en cours</div>
        </div>
        <Clock className="absolute right-4 bottom-4 text-white/20" size={60} />
      </div>
      <div className="bg-neutral-900 text-white p-6 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-3xl font-bold mb-1">{loading ? '—' : stats.total}</div>
          <div className="text-xs font-medium uppercase tracking-wider opacity-80">Commandes Totales</div>
        </div>
        <Package className="absolute right-4 bottom-4 text-white/20" size={60} />
      </div>
      <div className="bg-white border border-neutral-200 p-6 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-3xl font-bold mb-1 text-neutral-900">{loading ? '—' : stats.favorites}</div>
          <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">Articles Favoris</div>
        </div>
        <Heart className="absolute right-4 bottom-4 text-neutral-100" size={60} />
      </div>
    </div>

    {/* Recent Orders */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-neutral-900">Commandes Récentes</h3>
        <button className="text-sm font-bold text-[#6aa200] hover:underline" onClick={onSeeAllOrders}>
          Voir tout
        </button>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-neutral-500">Chargement...</div>
        ) : recentOrders.length === 0 ? (
          <div className="text-sm text-neutral-500">Aucune commande.</div>
        ) : (
          recentOrders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  </div>
);

const OrdersSection = ({ orders, loading }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-neutral-900">Mes Commandes</h2>
      <select className="bg-neutral-100 border-none rounded-lg text-sm font-medium px-3 py-2 outline-none focus:ring-2 focus:ring-[#6aa200]/20">
        <option>Toutes les commandes</option>
        <option>En cours</option>
        <option>Livrées</option>
        <option>Annulées</option>
      </select>
    </div>
    <div className="space-y-3">
      {loading ? (
        <div className="text-sm text-neutral-500">Chargement...</div>
      ) : orders.length === 0 ? (
        <div className="text-sm text-neutral-500">Aucune commande.</div>
      ) : (
        orders.map((order) => <OrderCard key={order.id} order={order} />)
      )}
    </div>
  </div>
);

const AddressSection = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-neutral-900">Mes Adresses</h2>
      <button className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
        + Nouvelle Adresse
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MOCK_ADDRESSES.map(addr => (
        <AddressCard key={addr.id} address={addr} />
      ))}
    </div>
  </div>
);

const SettingsSection = ({ profile }) => {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');

  return (
  <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h2 className="text-xl font-bold text-neutral-900 mb-6">Paramètres du Compte</h2>
    
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
        <h3 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Informations Personnelles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Nom complet</label>
            <input defaultValue={fullName} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Email</label>
            <input defaultValue={profile?.email || ''} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Téléphone</label>
            <input defaultValue="" className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
        </div>
        <div className="pt-2 flex justify-end">
           <button className="text-sm font-bold text-white bg-[#6aa200] hover:bg-[#5a8a00] px-4 py-2 rounded-lg transition-colors">
             Enregistrer
           </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
        <h3 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Sécurité</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-900">Mot de passe</p>
            <p className="text-xs text-neutral-500">Dernière modification il y a 3 mois</p>
          </div>
          <button className="text-sm font-bold text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-3 py-1.5 rounded-lg">
            Modifier
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
        <h3 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Préférences</h3>
        <div className="flex items-center justify-between">
           <span className="text-sm font-medium text-neutral-700">Recevoir les offres par email</span>
           <div className="w-10 h-5 bg-[#6aa200] rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
           </div>
        </div>
        <div className="flex items-center justify-between">
           <span className="text-sm font-medium text-neutral-700">Notifications SMS</span>
           <div className="w-10 h-5 bg-neutral-200 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
           </div>
        </div>
      </div>
    </div>
  </div>
  );
};

// --- Main Page ---

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [userProfile, setUserProfile] = useState(null);
  const tokenPayload = getCurrentUserPayload();
  const { wishlistItems } = useWishlist();
  const localWishlistCount = wishlistItems.length;
  const [orders, setOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, favorites: 0 });
  const [loadingOverview, setLoadingOverview] = useState(true);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      if (!tokenPayload?.sub) {
        setLoadingOverview(false);
        return;
      }
      setLoadingOverview(true);
      try {
        const [profile, ordersDto, wishlist] = await Promise.all([
          getUserProfile(tokenPayload.sub),
          getCustomerOrders(tokenPayload.sub, 0, 100),
          getCustomerWishlist(tokenPayload.sub)
        ]);

        if (!mounted) return;
        setUserProfile(profile);

        const mappedOrders = ordersDto.map((o) => ({
          id: `#${o.orderNumber || `ORD-${o.id}`}`,
          date: formatOrderDate(o.createdAt),
          total: formatMoney(o.amount, o.currency || 'FCFA'),
          status: mapOrderStatus(o.currentStatus),
          items: countOrderItems(o.items)
        }));

        setOrders(mappedOrders);
        setRecentOrders(mappedOrders.slice(0, 3));

        const inProgress = ordersDto.filter((o) => {
          const st = `${o.currentStatus || ''}`.toUpperCase();
          return st && st !== 'DELIVERED' && st !== 'CANCELED';
        }).length;

        setStats({
          total: ordersDto.length,
          inProgress,
          favorites: Math.max(Array.isArray(wishlist) ? wishlist.length : 0, localWishlistCount)
        });
      } catch {
        if (!mounted) return;
        setUserProfile(null);
        setOrders([]);
        setRecentOrders([]);
        setStats({ total: 0, inProgress: 0, favorites: localWishlistCount });
      } finally {
        if (!mounted) return;
        setLoadingOverview(false);
      }
    };

    loadAll();
    return () => {
      mounted = false;
    };
  }, [tokenPayload?.sub, localWishlistCount]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

 const displayName = useMemo(() => {
    const firstName = userProfile?.firstName || tokenPayload?.firstName || '';
    return firstName || tokenPayload?.email || 'Utilisateur';
  }, [tokenPayload?.email, tokenPayload?.firstName, userProfile?.firstName]);

  const displayEmail = userProfile?.email || tokenPayload?.email || '—';
  const avatarUrl = userProfile?.avatarUrl || tokenPayload?.avatarUrl || DEFAULT_AVATAR;
  const memberSinceYear = userProfile?.createdAt
    ? String(userProfile.createdAt).slice(0, 4)
    : (tokenPayload?.iat ? new Date(tokenPayload.iat * 1000).getFullYear() : '—');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-8 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
          <div className="relative group">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white dark:border-neutral-900 shadow-lg">
              <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-[#6aa200] text-white rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform">
              <Camera size={14} />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">{displayName}</h1>
            <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1">
              <span>{displayEmail}</span>
              <span className="w-1 h-1 bg-neutral-300 rounded-full" />
              <span>Membre depuis {memberSinceYear}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-2 space-y-1 sticky top-32">
              <SidebarItem 
                icon={User} 
                label="Vue d'ensemble" 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')} 
              />
              <SidebarItem 
                icon={Package} 
                label="Commandes" 
                active={activeTab === 'orders'} 
                onClick={() => setActiveTab('orders')} 
              />
              <Link to="/wishlist">
                <SidebarItem icon={Heart} label="Mes Favoris" active={false} onClick={() => {}} />
              </Link>
              <SidebarItem 
                icon={MapPin} 
                label="Adresses" 
                active={activeTab === 'addresses'} 
                onClick={() => setActiveTab('addresses')} 
              />
              <SidebarItem 
                icon={CreditCard} 
                label="Moyens de paiement" 
                active={activeTab === 'payments'} 
                onClick={() => setActiveTab('payments')} 
              />
              <div className="my-2 border-t border-neutral-100 dark:border-neutral-800" />
              <SidebarItem 
                icon={Settings} 
                label="Paramètres" 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')} 
              />
              <SidebarItem 
                icon={LogOut} 
                label="Déconnexion" 
                active={false} 
                danger 
                onClick={handleLogout} 
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-[500px]">
            {activeTab === 'overview' && (
              <OverviewSection
                stats={stats}
                recentOrders={recentOrders}
                loading={loadingOverview}
                onSeeAllOrders={() => setActiveTab('orders')}
              />
            )}
            {activeTab === 'orders' && <OrdersSection orders={orders} loading={loadingOverview} />}
            {activeTab === 'addresses' && <AddressSection />}
            {activeTab === 'settings' && <SettingsSection profile={userProfile} />}
            {activeTab === 'payments' && (
              <div className="flex flex-col items-center justify-center h-64 text-neutral-500 animate-in fade-in">
                <CreditCard size={48} className="mb-4 opacity-20" />
                <p>Aucun moyen de paiement enregistré</p>
                <button className="mt-4 text-[#6aa200] font-bold text-sm hover:underline">Ajouter une carte</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
