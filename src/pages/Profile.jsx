import PageSEO from "@/components/PageSEO";
import { useState, useEffect, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut, 
  Heart,
  Clock,
  Store,
  Camera,
  LocateFixed,
  Loader2
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import { logout, getCurrentUserPayload, updateUserProfile } from '@/services/authService.js';
import { 
  cancelCustomerOrder,
  createCustomerAddress,
  deleteCustomerAccount,
  deleteCustomerAddress,
  openOrderReceipt,
  setDefaultCustomerAddress,
  updateCustomerAddress
} from '@/services/customerService.js';
import { hasCoordinates, normalizeCustomerAddress, normalizeCustomerAddresses, toCustomerAddressPayload } from '@/utils/customerAddress';
import { locateCurrentAddress } from '@/utils/geolocation';
import { useWishlist } from '@/features/wishlist/WishlistContext';
import { useCustomerSession } from '@/features/customerSession/CustomerSessionContext.jsx';
import { useAppConfig } from '@/features/appConfig/useAppConfig';
import { resolveBackendAssetUrl } from '@/services/categoryService';
import { getReturnWindow } from '@/utils/policy';
import {
  computeReturnDeadline,
  formatDate,
  formatMoney,
  getOrderStatusMeta,
  hasReceipt,
  isCustomerCancellable,
} from '@/utils/orderStatus';
import OrderCard from '@/components/orders/OrderCard';
import OrderList, { OrderCardSkeleton, OrdersEmptyState } from '@/components/orders/OrderList';

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
    {active && <Motion.div layoutId="activeTab" className="absolute inset-0 bg-[#6aa200] z-0" />}
  </button>
);

const AddressCard = ({ address, onDelete, onSetDefault, onEdit }) => {
  const isDefault = Boolean(address?.isDefault);
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
        <span className="font-bold text-neutral-900">{address.label || 'Adresse'}</span>
      </div>
      <div className="space-y-1 text-sm text-neutral-600">
        <p className="font-medium text-neutral-900">{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>{[address.city, address.postalCode].filter(Boolean).join(' ')}</p>
        <p>{address.country}</p>
        <p className="text-xs text-neutral-400 mt-2">{address.phoneNumber}</p>
        {hasCoordinates(address) && (
          <p className="text-xs text-[#6aa200] flex items-center gap-1"><LocateFixed size={11} /> Position GPS enregistrée</p>
        )}
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
          onClick={onEdit}
          className="text-xs font-bold text-neutral-500 hover:text-neutral-900"
        >
          Modifier
        </button>
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

const maskCardNumber = (value) => {
  const digits = `${value || ''}`.replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  return `•••• •••• •••• ${digits.slice(-4)}`;
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
          <>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </>
        ) : recentOrders.length === 0 ? (
          <OrdersEmptyState />
        ) : (
          recentOrders.map((order) => <OrderCard key={order.id ?? order.orderNumber} order={order} compact />)
        )}
      </div>
    </div>
  </div>
);

const EMPTY_ADDRESS_FORM = {
  label: 'Domicile',
  line1: '',
  line2: '',
  city: '',
  postalCode: '',
  country: '',
  phoneNumber: '',
  latitude: null,
  longitude: null,
  isDefault: false
};

const AddressSection = ({ addresses, loading, onCreate, onUpdate, onDelete, onSetDefault }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [form, setForm] = useState(EMPTY_ADDRESS_FORM);

  const closeForm = () => {
    setForm(EMPTY_ADDRESS_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    if (showForm) {
      closeForm();
      return;
    }
    setForm(EMPTY_ADDRESS_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (address) => {
    setForm({ ...EMPTY_ADDRESS_FORM, ...address });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      // Adresse retouchee a la main : la position GPS ne lui correspond plus forcement
      if (name === 'line1' || name === 'city' || name === 'postalCode') {
        next.latitude = null;
        next.longitude = null;
      }
      return next;
    });
  };

  const handleUseCurrentPosition = async () => {
    if (isLocating) return;
    setIsLocating(true);
    try {
      const located = await locateCurrentAddress();
      setForm((prev) => ({
        ...prev,
        line1: located.street || prev.line1,
        city: located.city || prev.city,
        postalCode: located.postalCode || prev.postalCode,
        country: located.country || prev.country,
        latitude: located.latitude,
        longitude: located.longitude
      }));
      toast.success("Adresse détectée");
    } catch (error) {
      toast.error(error?.message || "Impossible de récupérer votre position actuellement.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = toCustomerAddressPayload(form);
    if (!payload.line1) {
      toast.error("L'adresse est obligatoire.");
      return;
    }
    const saved = editingId ? await onUpdate(editingId, payload) : await onCreate(payload);
    if (saved) {
      closeForm();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Mes Adresses</h2>
        <button 
          onClick={openCreateForm}
          className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          {showForm ? 'Fermer' : '+ Nouvelle Adresse'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          {editingId && (
            <p className="md:col-span-2 text-sm font-bold text-neutral-900">Modifier l'adresse</p>
          )}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Type</label>
            <input name="label" value={form.label} onChange={handleChange} placeholder="Domicile, Bureau…" maxLength={100} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Complément</label>
            <input name="line2" value={form.line2} onChange={handleChange} placeholder="Bâtiment, étage, repère…" maxLength={255} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-500 uppercase">Adresse</label>
              <button
                type="button"
                onClick={handleUseCurrentPosition}
                disabled={isLocating}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#6aa200] hover:underline disabled:opacity-60"
              >
                {isLocating ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
                {isLocating ? 'Localisation…' : 'Utiliser ma position'}
              </button>
            </div>
            <input required name="line1" value={form.line1} onChange={handleChange} placeholder="Rue, numéro, quartier…" maxLength={255} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
            {hasCoordinates(form) && (
              <p className="text-xs text-[#6aa200] flex items-center gap-1"><MapPin size={11} /> Position GPS capturée</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Ville</label>
            <input required name="city" value={form.city} onChange={handleChange} maxLength={100} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Code postal</label>
            <input name="postalCode" value={form.postalCode} onChange={handleChange} maxLength={20} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Pays</label>
            <input name="country" value={form.country} onChange={handleChange} maxLength={100} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Téléphone</label>
            <input name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange} maxLength={30} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-[#6aa200] outline-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-600 md:col-span-2">
            <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} />
            Définir comme adresse par défaut
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            {editingId && (
              <button type="button" onClick={closeForm} className="text-sm font-bold text-neutral-500 hover:text-neutral-900 px-4 py-2 rounded-lg transition-colors">
                Annuler
              </button>
            )}
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
              onEdit={() => openEditForm(addr)}
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
      // Contrat API (CustomerDto) : phoneNumber, city, country ; anciens noms lus par tolerance
      telephone: profile?.phoneNumber || profile?.telephone || '',
      ville: profile?.city || profile?.ville || '',
      pays: profile?.country || profile?.pays || ''
    });
  }, [profile]);

  useEffect(() => {
    saveLocalJson(PREFS_STORAGE_KEY, prefs);
  }, [prefs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseAccount = async () => {
    if (!userId) return;
    const confirmed = window.confirm(
      'Fermer définitivement votre compte ? Vos données personnelles seront effacées ; vos commandes passées sont conservées sous forme anonyme (obligations comptables).'
    );
    if (!confirmed) return;
    try {
      await deleteCustomerAccount(userId);
      await logout();
      toast.success('Votre compte a été fermé.');
      window.location.assign('/');
    } catch {
      toast.error('Impossible de fermer le compte pour le moment. Contactez le service client.');
    }
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
        phoneNumber: form.telephone,
        city: form.ville,
        country: form.pays
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

      <div className="bg-white p-6 rounded-2xl border border-red-100 space-y-3">
        <h3 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Fermer mon compte</h3>
        <p className="text-xs text-neutral-500">
          Vos données personnelles sont effacées et l'accès au compte est supprimé. Les commandes passées sont conservées sous forme anonyme.
        </p>
        <button
          type="button"
          onClick={handleCloseAccount}
          className="text-sm font-bold text-red-600 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg"
        >
          Fermer mon compte
        </button>
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
  const activeTab = searchParams.get('tab') || 'overview';
  const tokenPayload = getCurrentUserPayload();
  const { wishlistItems } = useWishlist();
  const customerSession = useCustomerSession();
  const localWishlistCount = wishlistItems.length;
  const [orderBusyAction, setOrderBusyAction] = useState('');
  const { data: appConfig } = useAppConfig();
  const [paymentMethods, setPaymentMethods] = useState(() => loadLocalJson(PAYMENT_STORAGE_KEY, []));

  useEffect(() => {
    saveLocalJson(PAYMENT_STORAGE_KEY, paymentMethods);
  }, [paymentMethods]);

  const setActiveTab = (nextTab) => {
    const next = new URLSearchParams(searchParams);
    if (nextTab) next.set('tab', nextTab);
    else next.delete('tab');
    navigate({ pathname: '/profile', search: `?${next.toString()}` });
  };

  const profileCollection = customerSession?.customerCollection || null;
  const loadingOverview = Boolean(customerSession?.isLoading);
  const loadingAddresses = Boolean(customerSession?.isLoading);
  const userProfile = useMemo(() => profileCollection?.customer || null, [profileCollection]);

  const addresses = useMemo(() => {
    return normalizeCustomerAddresses(profileCollection?.addresses);
  }, [profileCollection]);

  const customerEmail = fixMojibake(userProfile?.email) || fixMojibake(tokenPayload?.email) || '';

  const orders = useMemo(() => {
    const ordersDto = Array.isArray(profileCollection?.orders) ? profileCollection.orders : [];
    const returnWindow = getReturnWindow(appConfig);
    return ordersDto.map((o) => {
      const orderNumber = o.orderNumber || `ORD-${o.id}`;
      const meta = getOrderStatusMeta(o.currentStatus);
      const lines = Array.isArray(o.items) ? o.items : [];
      const returnDeadline = computeReturnDeadline(
        { status: meta.code, deliveryDate: o.deliveryDate, createdAt: o.createdAt },
        returnWindow
      );
      const returnable = Boolean(returnDeadline && Date.now() <= returnDeadline.getTime());
      let statusHint = '';
      if (meta.code === 'DELIVERED') {
        statusHint = o.deliveryDate ? `Livrée le ${formatDate(o.deliveryDate)}` : '';
        if (returnable) statusHint = `${statusHint ? `${statusHint} · ` : ''}Retour possible jusqu'au ${formatDate(returnDeadline)}`;
      } else if (meta.code === 'PENDING') {
        statusHint = 'Paiement non finalisé';
      }
      return {
        id: o.id,
        orderNumber,
        date: formatDate(o.createdAt) || '—',
        total: formatMoney(o.amount, o.currency || 'FCFA'),
        statusCode: meta.code,
        statusLabel: meta.label,
        statusTone: meta.tone,
        statusHint,
        itemCount: lines.reduce((acc, it) => acc + (Number(it?.quantity) || 0), 0),
        thumbnails: lines.map((it, index) => ({
          key: `${it?.articleId ?? 'line'}-${index}`,
          name: `${it?.articleName || 'Article'}`,
          imageUrl: resolveBackendAssetUrl(it?.mainImageUrl) || '',
        })),
        shippingMethod: `${o.shippingMethodLabel || ''}`.trim(),
        shippingAddress: `${o.shippingAddress || ''}`.trim(),
        cancellable: isCustomerCancellable(meta.code),
        receiptAvailable: hasReceipt(meta.code),
        returnable,
        returnDeadline,
        returnsHref: customerEmail
          ? `/returns?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(customerEmail)}`
          : `/returns?order=${encodeURIComponent(orderNumber)}`,
      };
    });
  }, [profileCollection, appConfig, customerEmail]);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);

  const stats = useMemo(() => {
    const ordersDto = Array.isArray(profileCollection?.orders) ? profileCollection.orders : [];
    const wishlist = Array.isArray(profileCollection?.wishlist) ? profileCollection.wishlist : [];
    const inProgress = ordersDto.filter((o) => getOrderStatusMeta(o.currentStatus).group === 'active').length;

    return {
      total: ordersDto.length,
      inProgress,
      favorites: Math.max(wishlist.length, localWishlistCount)
    };
  }, [localWishlistCount, profileCollection]);

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

  const handleCancelOrder = async (order) => {
    const paid = order.statusCode === 'PAID';
    const question = paid
      ? 'Annuler cette commande ? Elle sera remboursée automatiquement sur votre moyen de paiement.'
      : 'Annuler cette commande ?';
    if (!window.confirm(question)) return;
    setOrderBusyAction(`cancel-${order.id}`);
    try {
      await cancelCustomerOrder(order.id);
      customerSession?.updateCustomerCollection?.((prev) => ({
        ...(prev || {}),
        orders: (Array.isArray(prev?.orders) ? prev.orders : []).map((o) =>
          o.id === order.id ? { ...o, currentStatus: 'CANCELED' } : o
        )
      }));
      toast.success(paid ? 'Commande annulée, remboursement en cours.' : 'Commande annulée.');
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cette commande n'est plus annulable (déjà en préparation). Contactez le service client.");
    } finally {
      setOrderBusyAction('');
    }
  };

  const handleOrderReceipt = async (order) => {
    setOrderBusyAction(`receipt-${order.id}`);
    try {
      await openOrderReceipt(order.id);
    } catch {
      toast.error("Impossible d'ouvrir le justificatif.");
    } finally {
      setOrderBusyAction('');
    }
  };

  const handleProfileUpdated = (updated) => {
    customerSession?.updateCustomerCollection?.((prev) => ({
      ...(prev || {}),
      customer: updated || null
    }));
  };

  const apiErrorMessage = (err, fallback) =>
    err?.response?.data?.errorMessage || err?.response?.data?.message || err?.message || fallback;

  const handleCreateAddress = async (payload) => {
    if (!tokenPayload?.sub) {
      toast.error("Connexion requise.");
      return null;
    }
    try {
      const created = await createCustomerAddress(tokenPayload.sub, toCustomerAddressPayload(payload));
      if (!created) return null;
      customerSession?.updateCustomerCollection?.((prev) => {
        const currentAddresses = Array.isArray(prev?.addresses) ? prev.addresses : [];
        // Plus recente en tete, comme la liste renvoyee par l'API
        const nextAddresses = [created, ...currentAddresses];
        const normalizedAddresses = created.isDefault
          ? nextAddresses.map((addr) => (addr.id === created.id ? addr : { ...addr, isDefault: false }))
          : nextAddresses;
        return {
          ...(prev || {}),
          addresses: normalizedAddresses
        };
      });
      toast.success("Adresse enregistrée.");
      return created;
    } catch (err) {
      toast.error(apiErrorMessage(err, "Création impossible."));
      return null;
    }
  };

  const handleUpdateAddress = async (addressId, payload) => {
    if (!tokenPayload?.sub) {
      toast.error("Connexion requise.");
      return null;
    }
    try {
      const updated = await updateCustomerAddress(tokenPayload.sub, addressId, toCustomerAddressPayload(payload));
      if (!updated) return null;
      const updatedIsDefault = normalizeCustomerAddress(updated).isDefault;
      customerSession?.updateCustomerCollection?.((prev) => ({
        ...(prev || {}),
        addresses: (Array.isArray(prev?.addresses) ? prev.addresses : []).map((addr) => {
          if (addr.id === updated.id) return updated;
          return updatedIsDefault ? { ...addr, isDefault: false } : addr;
        })
      }));
      toast.success("Adresse mise à jour.");
      return updated;
    } catch (err) {
      toast.error(apiErrorMessage(err, "Mise à jour impossible."));
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
      customerSession?.updateCustomerCollection?.((prev) => ({
        ...(prev || {}),
        addresses: (Array.isArray(prev?.addresses) ? prev.addresses : []).filter((addr) => addr.id !== addressId)
      }));
      toast.success("Adresse supprimée.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Suppression impossible."));
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    if (!tokenPayload?.sub) {
      toast.error("Connexion requise.");
      return;
    }
    try {
      const updated = await setDefaultCustomerAddress(tokenPayload.sub, addressId);
      customerSession?.updateCustomerCollection?.((prev) => ({
        ...(prev || {}),
        addresses: (Array.isArray(prev?.addresses) ? prev.addresses : []).map((addr) => ({
          ...addr,
          isDefault: addr.id === updated?.id
        }))
      }));
      toast.success("Adresse par défaut mise à jour.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Mise à jour impossible."));
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
      <PageSEO title="Mon Profil" noindex />
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
              <Link to="/sel-off">
                <SidebarItem icon={Store} label="Ma boutique" active={false} onClick={() => {}} />
              </Link>
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
            {activeTab === 'orders' && (
              <OrderList
                orders={orders}
                loading={loadingOverview}
                onCancel={handleCancelOrder}
                onReceipt={handleOrderReceipt}
                busyAction={orderBusyAction}
              />
            )}
            {activeTab === 'addresses' && (
              <AddressSection
                addresses={addresses}
                loading={loadingAddresses}
                onCreate={handleCreateAddress}
                onUpdate={handleUpdateAddress}
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
      
      <div style={{ display: 'none' }}>
      </div>
    </div>
  );
}
