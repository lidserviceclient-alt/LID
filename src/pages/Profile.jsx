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
import { toast } from 'sonner';
import { getUserProfile, logout, getCurrentUserPayload, updateUserProfile } from '@/services/authService.js';
import { 
  getCustomerOrders, 
  getCustomerWishlist,
  getCustomerAddresses,
  createCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress
} from '@/services/customerService.js';
import { useWishlist } from '@/features/wishlist/WishlistContext';

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const PAYMENT_STORAGE_KEY = 'paymentMethods';
const PREFS_STORAGE_KEY = 'appPreferences';

const loadLocalJson = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveLocalJson = (key, value) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

const fixMojibake = (value) => {
  if (typeof value !== 'string') return value;
  const s = value.trim();
  if (!s) return value;
  if (!/(Ã.|Â|â€™|â€œ|â€\u009d|â€¦|â€“|â€”)/.test(s)) return value;
  try {
    const bytes = Uint8Array.from([...s].map((c) => c.charCodeAt(0)));
    const decoded = new TextDecoder('utf-8').decode(bytes);
    return decoded.includes('�') ? value : decoded;
  } catch {
    return value;
  }
};
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

const OrderCard = ({ order, email }) => {
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

  const trackingHref = order?.orderNumber
    ? `/tracking?order=${encodeURIComponent(order.orderNumber)}`
    : "/tracking";
  const returnsHref = order?.orderNumber && email
    ? `/returns?order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(email)}`
    : "/returns";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-neutral-100 bg-white hover:border-[#6aa200]/30 hover:shadow-md transition-all duration-300 gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
          <Package size={20} />
        </div>
        <div>
          <h4 className="font-bold text-neutral-900">{order.displayId}</h4>
          <p className="text-xs text-neutral-500">{order.date} • {order.items} article(s)</p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
        <span className="font-bold text-neutral-900">{order.total}</span>
        <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getStatusColor(order.status))}>
          {getStatusLabel(order.status)}
        </span>
        <Link
          to={returnsHref}
          className="text-xs font-semibold text-neutral-500 hover:text-[#6aa200] transition-colors"
        >
          Retour
        </Link>
        <Link to={trackingHref} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-[#6aa200] transition-colors">
          <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
};

const AddressCard = ({ address, onDelete, onSetDefault }) => {
  const isDefault = Boolean(address?.isDefault ?? address?.default);
  return (
    <div className={cn(
      "p-5 rounded-2xl border transition-all duration-300 relative group",
      isDefault 
        ? "border-[#6aa200] bg-[#6aa200]/5" 
        : "border-neutral-200 bg-white hover:border-[#6aa200]/50"
    )}>
      {isDefault && (
        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-[#6aa200] bg-white px-2 py-1 rounded-full shadow-sm">
          Par défaut
        </span>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-full", isDefault ? "bg-[#6aa200] text-white" : "bg-neutral-100 text-neutral-500")}>
          <MapPin size={16} />
        </div>
        <span className="font-bold text-neutral-900">{address.type || 'Adresse'}</span>
      </div>
      <div className="space-y-1 text-sm text-neutral-600">
        <p className="font-medium text-neutral-900">{address.name}</p>
        <p>{address.addressLine || address.address}</p>
        <p>{[address.city, address.postalCode].filter(Boolean).join(' ')}</p>
        <p>{address.country}</p>
        <p className="text-xs text-neutral-400 mt-2">{address.phone}</p>
      </div>
      <div className="mt-4 flex items-center gap-3">
        {!isDefault && (
          <button
            onClick={onSetDefault}
            className="text-xs font-bold text-[#6aa200] hover:underline"
          >
            Définir par défaut
          </button>
        )}
        <button
          onClick={onDelete}
          className="text-xs font-bold text-neutral-400 hover:text-red-500"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
};

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

const maskCardNumber = (value) => {
  const digits = `${value || ''}`.replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  return `•••• •••• •••• ${digits.slice(-4)}`;
};

const OverviewSection = ({ stats, recentOrders, onSeeAllOrders, loading, email }) => (
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
          recentOrders.map((order) => <OrderCard key={order.displayId} order={order} email={email} />)
        )}
      </div>
    </div>
  </div>
);

const OrdersSection = ({ orders, loading, filter, onFilterChange, email }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-neutral-900">Mes Commandes</h2>
      <select 
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="bg-neutral-100 border-none rounded-lg text-sm font-medium px-3 py-2 outline-none focus:ring-2 focus:ring-[#6aa200]/20"
      >
        <option value="all">Toutes les commandes</option>
        <option value="processing">En cours</option>
        <option value="delivered">Livrées</option>
        <option value="cancelled">Annulées</option>
      </select>
    </div>
    <div className="space-y-3">
      {loading ? (
        <div className="text-sm text-neutral-500">Chargement...</div>
      ) : orders.length === 0 ? (
        <div className="text-sm text-neutral-500">Aucune commande.</div>
      ) : (
        orders.map((order) => <OrderCard key={order.displayId} order={order} email={email} />)
      )}
    </div>
  </div>
);

const AddressSection = ({ addresses, loading, onCreate, onDelete, onSetDefault }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'Domicile',
    name: '',
    addressLine: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    isDefault: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const saved = await onCreate(form);
    if (saved) {
      setForm({
        type: 'Domicile',
        name: '',
        addressLine: '',
        city: '',
        postalCode: '',
        country: '',
        phone: '',
        isDefault: false
      });
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Mes Adresses</h2>
        <button 
          onClick={() => setShowForm((v) => !v)}
          className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          {showForm ? 'Fermer' : '+ Nouvelle Adresse'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Type</label>
            <input name="type" value={form.type} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Nom</label>
            <input required name="name" value={form.name} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-neutral-500 uppercase">Adresse</label>
            <input required name="addressLine" value={form.addressLine} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Ville</label>
            <input required name="city" value={form.city} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Code postal</label>
            <input name="postalCode" value={form.postalCode} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Pays</label>
            <input name="country" value={form.country} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Téléphone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-600 md:col-span-2">
            <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} />
            Définir comme adresse par défaut
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="text-sm font-bold text-white bg-[#6aa200] hover:bg-[#5a8a00] px-4 py-2 rounded-lg transition-colors">
              Enregistrer
            </button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="text-sm text-neutral-500">Chargement...</div>
        ) : addresses.length === 0 ? (
          <div className="text-sm text-neutral-500">Aucune adresse enregistrée.</div>
        ) : (
          addresses.map(addr => (
            <AddressCard 
              key={addr.id} 
              address={addr} 
              onDelete={() => onDelete(addr.id)} 
              onSetDefault={() => onSetDefault(addr.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const PaymentSection = ({ paymentMethods, onAdd, onRemove }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'card',
    label: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.type === 'card' && !form.cardNumber) {
      toast.error("Numéro de carte requis.");
      return;
    }
    if (form.type === 'mobile' && !form.phone) {
      toast.error("Numéro de téléphone requis.");
      return;
    }
    onAdd(form);
    setForm({
      type: 'card',
      label: '',
      cardNumber: '',
      cardName: '',
      expiry: '',
      phone: ''
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Moyens de paiement</h2>
        <button 
          onClick={() => setShowForm((v) => !v)}
          className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          {showForm ? 'Fermer' : '+ Ajouter'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none">
              <option value="card">Carte</option>
              <option value="mobile">Mobile money</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Libellé</label>
            <input name="label" value={form.label} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          {form.type === 'card' ? (
            <>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Numéro de carte</label>
                <input name="cardNumber" value={form.cardNumber} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase">Nom sur la carte</label>
                <input name="cardName" value={form.cardName} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase">Expiration</label>
                <input name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/AA" className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
              </div>
            </>
          ) : (
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-neutral-500 uppercase">Téléphone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
            </div>
          )}
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="text-sm font-bold text-white bg-[#6aa200] hover:bg-[#5a8a00] px-4 py-2 rounded-lg transition-colors">
              Enregistrer
            </button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.length === 0 ? (
          <div className="text-sm text-neutral-500">Aucun moyen de paiement enregistré.</div>
        ) : (
          paymentMethods.map((method) => (
            <div key={method.id} className="p-5 rounded-2xl border border-neutral-200 bg-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                  <CreditCard size={16} />
                  {method.label || (method.type === 'mobile' ? 'Mobile money' : 'Carte bancaire')}
                </div>
                {method.type === 'card' ? (
                  <div className="text-xs text-neutral-500 mt-2">
                    {method.cardNumberMasked} • {method.expiry || '—'}
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500 mt-2">{method.phone}</div>
                )}
              </div>
              <button onClick={() => onRemove(method.id)} className="text-xs font-bold text-neutral-400 hover:text-red-500">
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SettingsSection = ({ profile, userId, onProfileUpdated }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    ville: '',
    pays: ''
  });
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState(() => loadLocalJson(PREFS_STORAGE_KEY, { emailOffers: true, smsNotifications: false }));

  useEffect(() => {
    setForm({
      firstName: fixMojibake(profile?.firstName) || '',
      lastName: fixMojibake(profile?.lastName) || '',
      email: fixMojibake(profile?.email) || '',
      telephone: profile?.telephone || '',
      ville: profile?.ville || '',
      pays: profile?.pays || ''
    });
  }, [profile]);

  useEffect(() => {
    saveLocalJson(PREFS_STORAGE_KEY, prefs);
  }, [prefs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error("Connexion requise.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateUserProfile(userId, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        telephone: form.telephone,
        ville: form.ville,
        pays: form.pays
      });
      onProfileUpdated(updated);
      toast.success("Profil mis à jour.");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Mise à jour impossible.");
    } finally {
      setSaving(false);
    }
  };

  const togglePref = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
  <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h2 className="text-xl font-bold text-neutral-900 mb-6">Paramètres du Compte</h2>
    
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
        <h3 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Informations Personnelles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Prénom</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Nom</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Téléphone</label>
            <input name="telephone" value={form.telephone} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Ville</label>
            <input name="ville" value={form.ville} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Pays</label>
            <input name="pays" value={form.pays} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
        </div>
        <div className="pt-2 flex justify-end">
           <button 
             onClick={handleSave}
             disabled={saving}
             className="text-sm font-bold text-white bg-[#6aa200] hover:bg-[#5a8a00] px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
           >
             {saving ? 'Enregistrement...' : 'Enregistrer'}
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
           <button 
             onClick={() => togglePref('emailOffers')}
             className={cn("w-10 h-5 rounded-full relative transition-colors", prefs.emailOffers ? "bg-[#6aa200]" : "bg-neutral-200")}
           >
              <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform", prefs.emailOffers ? "right-1" : "left-1")} />
           </button>
        </div>
        <div className="flex items-center justify-between">
           <span className="text-sm font-medium text-neutral-700">Notifications SMS</span>
           <button 
             onClick={() => togglePref('smsNotifications')}
             className={cn("w-10 h-5 rounded-full relative transition-colors", prefs.smsNotifications ? "bg-[#6aa200]" : "bg-neutral-200")}
           >
              <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform", prefs.smsNotifications ? "right-1" : "left-1")} />
           </button>
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
  const [ordersFilter, setOrdersFilter] = useState('all');
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, favorites: 0 });
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState(() => loadLocalJson(PAYMENT_STORAGE_KEY, []));

  useEffect(() => {
    saveLocalJson(PAYMENT_STORAGE_KEY, paymentMethods);
  }, [paymentMethods]);

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
      setLoadingAddresses(true);
      try {
        const [profile, ordersDto, wishlist, addressList] = await Promise.all([
          getUserProfile(tokenPayload.sub),
          getCustomerOrders(tokenPayload.sub, 0, 100),
          getCustomerWishlist(tokenPayload.sub),
          getCustomerAddresses(tokenPayload.sub)
        ]);

        if (!mounted) return;
        setUserProfile(profile);
        setAddresses(Array.isArray(addressList) ? addressList : []);

        const mappedOrders = ordersDto.map((o) => {
          const orderNumber = o.orderNumber || `ORD-${o.id}`;
          return {
            displayId: `#${orderNumber}`,
            orderNumber,
          date: formatOrderDate(o.createdAt),
          total: formatMoney(o.amount, o.currency || 'FCFA'),
          status: mapOrderStatus(o.currentStatus),
          items: countOrderItems(o.items)
          };
        });

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
        setAddresses([]);
        setStats({ total: 0, inProgress: 0, favorites: localWishlistCount });
      } finally {
        if (mounted) {
          setLoadingOverview(false);
          setLoadingAddresses(false);
        }
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
    const firstName =
      fixMojibake(userProfile?.firstName?.trim()) ||
      fixMojibake(tokenPayload?.firstName?.trim());

    return firstName || fixMojibake(tokenPayload?.email) || 'Utilisateur';
  }, [
    userProfile?.firstName,
    tokenPayload?.firstName,
    tokenPayload?.email,
  ]);


  const displayEmail = fixMojibake(userProfile?.email) || fixMojibake(tokenPayload?.email) || '—';
  const avatarUrl = userProfile?.avatarUrl || tokenPayload?.avatarUrl || DEFAULT_AVATAR;
  const memberSinceYear = userProfile?.createdAt
    ? String(userProfile.createdAt).slice(0, 4)
    : (tokenPayload?.iat ? new Date(tokenPayload.iat * 1000).getFullYear() : '—');

  const filteredOrders = useMemo(() => {
    if (ordersFilter === 'all') return orders;
    return orders.filter((order) => order.status === ordersFilter);
  }, [orders, ordersFilter]);

  const handleProfileUpdated = (updated) => {
    setUserProfile(updated);
  };

  const handleCreateAddress = async (payload) => {
    if (!tokenPayload?.sub) {
      toast.error("Connexion requise.");
      return null;
    }
    try {
      const created = await createCustomerAddress(tokenPayload.sub, payload);
      if (!created) return null;
      setAddresses((prev) => {
        const next = [...prev, created];
        if (created.isDefault) {
          return next.map((addr) => (addr.id === created.id ? addr : { ...addr, isDefault: false }));
        }
        return next;
      });
      toast.success("Adresse enregistrée.");
      return created;
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Création impossible.");
      return null;
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!tokenPayload?.sub) {
      toast.error("Connexion requise.");
      return;
    }
    try {
      await deleteCustomerAddress(tokenPayload.sub, addressId);
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      toast.success("Adresse supprimée.");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Suppression impossible.");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    if (!tokenPayload?.sub) {
      toast.error("Connexion requise.");
      return;
    }
    try {
      const updated = await setDefaultCustomerAddress(tokenPayload.sub, addressId);
      setAddresses((prev) => prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === updated?.id
      })));
      toast.success("Adresse par défaut mise à jour.");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Mise à jour impossible.");
    }
  };

  const handleAddPaymentMethod = (method) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const cardNumberMasked = method.type === 'card' ? maskCardNumber(method.cardNumber) : '';
    setPaymentMethods((prev) => [
      {
        ...method,
        id,
        cardNumberMasked
      },
      ...prev
    ]);
    toast.success("Moyen de paiement enregistré.");
  };

  const handleRemovePaymentMethod = (id) => {
    setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
    toast.success("Moyen de paiement supprimé.");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-8 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
          <div className="relative group">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white dark:border-neutral-900 shadow-lg">
              <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
            </div>
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
                email={displayEmail}
              />
            )}
            {activeTab === 'orders' && (
              <OrdersSection 
                orders={filteredOrders} 
                loading={loadingOverview} 
                filter={ordersFilter}
                onFilterChange={setOrdersFilter}
                email={displayEmail}
              />
            )}
            {activeTab === 'addresses' && (
              <AddressSection
                addresses={addresses}
                loading={loadingAddresses}
                onCreate={handleCreateAddress}
                onDelete={handleDeleteAddress}
                onSetDefault={handleSetDefaultAddress}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsSection 
                profile={userProfile} 
                userId={tokenPayload?.sub}
                onProfileUpdated={handleProfileUpdated}
              />
            )}
            {activeTab === 'payments' && (
              <PaymentSection
                paymentMethods={paymentMethods}
                onAdd={handleAddPaymentMethod}
                onRemove={handleRemovePaymentMethod}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
