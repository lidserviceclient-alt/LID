import { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Facebook, 
  Save, 
  Upload,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { updateMyPartnerPreferences } from '@/services/partnerBackofficePreferencesService';
import { getMyPartnerSettingsCollection, updateMyPartnerSettings } from '@/services/partnerBackofficeSettingsService';
import { uploadFile } from '@/services/fileStorageService';
import { usePartnerBackofficeBootstrap } from '@/features/partnerBackoffice/PartnerBackofficeBootstrapContext';

export default function Settings() {
  const bootstrap = usePartnerBackofficeBootstrap();
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [mainCategories, setMainCategories] = useState([]);

  const [settings, setSettings] = useState({
    partnerId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    headOfficeAddress: "",
    city: "",
    country: "",
    shopName: "",
    shopDescription: "",
    description: "",
    logoUrl: "",
    backgroundUrl: "",
    mainCategoryId: 1,
  });

  const [prefs, setPrefs] = useState({
    stockThreshold: 5,
    websiteUrl: "",
    instagramHandle: "",
    facebookPage: "",
    openingHoursJson: "{}",
  });

  const [hours, setHours] = useState({
    Lundi: { open: "09:00", close: "18:00" },
    Mardi: { open: "09:00", close: "18:00" },
    Mercredi: { open: "09:00", close: "18:00" },
    Jeudi: { open: "09:00", close: "18:00" },
    Vendredi: { open: "09:00", close: "18:00" },
    Samedi: { open: "09:00", close: "18:00" },
    Dimanche: { closed: true },
  });

  const weekdays = useMemo(() => ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], []);

  const applySettingsCollection = (collection) => {
      const s = collection?.settings || {};
      const p = collection?.preferences || {};
      setSettings((prev) => ({
        ...prev,
        partnerId: s?.partnerId || "",
        firstName: s?.firstName || "",
        lastName: s?.lastName || "",
        email: s?.email || "",
        phoneNumber: s?.phoneNumber || "",
        headOfficeAddress: s?.headOfficeAddress || "",
        city: s?.city || "",
        country: s?.country || "",
        shopName: s?.shopName || "",
        shopDescription: s?.shopDescription || "",
        description: s?.description || "",
        logoUrl: s?.logoUrl || "",
        backgroundUrl: s?.backgroundUrl || "",
        mainCategoryId: s?.mainCategoryId || 1,
      }));

      setPrefs({
        stockThreshold: Number(p?.stockThreshold || 5),
        websiteUrl: p?.websiteUrl || "",
        instagramHandle: p?.instagramHandle || "",
        facebookPage: p?.facebookPage || "",
        openingHoursJson: p?.openingHoursJson || "{}",
      });

      try {
        const parsed = JSON.parse(p?.openingHoursJson || "{}");
        if (parsed && typeof parsed === "object") {
          setHours((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
      }
  };

  const applyCategoriesCollection = (collection, currentMainCategoryId) => {
      const cats = collection?.categories || [];
      const mains = (Array.isArray(cats) ? cats : [])
        .filter((c) => !c?.parentId && !c?.parent_id)
        .map((c) => ({ id: Number(c?.id), name: c?.nom || c?.name }))
        .filter((c) => Number.isFinite(c.id) && c.name);
      setMainCategories(mains);
      if ((currentMainCategoryId || 0) <= 0 && mains.length > 0) {
        setSettings((prev) => ({ ...prev, mainCategoryId: mains[0].id }));
      }
  };

  const hydrate = async () => {
    setLoadingPage(true);
    setErrorMsg("");
    try {
      const collection = await getMyPartnerSettingsCollection();
      applySettingsCollection(collection);
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || "Impossible de charger les paramètres.");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    if (bootstrap?.routeKey !== 'settings') {
      return;
    }
    if (!bootstrap?.isSettingsCollectionResolved || !bootstrap?.isCategoriesCollectionResolved) {
      setLoadingPage(true);
      return;
    }
    if (bootstrap?.settingsCollection) {
      applySettingsCollection(bootstrap.settingsCollection);
      applyCategoriesCollection(bootstrap.categoriesCollection, bootstrap.settingsCollection?.settings?.mainCategoryId);
      setLoadingPage(false);
      setErrorMsg("");
      return;
    }
    setLoadingPage(false);
    setErrorMsg("Impossible de charger les paramètres.");
  }, [bootstrap]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      await updateMyPartnerSettings({
        partnerId: settings.partnerId || null,
        firstName: settings.firstName || null,
        lastName: settings.lastName || null,
        phoneNumber: settings.phoneNumber || null,
        shopName: settings.shopName || null,
        shopDescription: settings.shopDescription || null,
        description: settings.description || null,
        logoUrl: settings.logoUrl || null,
        backgroundUrl: settings.backgroundUrl || null,
        headOfficeAddress: settings.headOfficeAddress || null,
        city: settings.city || null,
        country: settings.country || null,
        mainCategoryId: settings.mainCategoryId || 1,
      });
      await updateMyPartnerPreferences({
        stockThreshold: Math.max(1, Number(prefs.stockThreshold || 5)),
        websiteUrl: prefs.websiteUrl || null,
        instagramHandle: prefs.instagramHandle || null,
        facebookPage: prefs.facebookPage || null,
        openingHoursJson: JSON.stringify(hours || {}),
      });
      await hydrate();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || "Échec de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoPick = async (file) => {
    if (!file) return;
    setErrorMsg("");
    setUploadingLogo(true);
    try {
      const res = await uploadFile(file, { folder: "partners" });
      const url = res?.url || "";
      if (url) {
        setSettings((p) => ({ ...p, logoUrl: url }));
      }
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || "Upload du logo impossible.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerPick = async (file) => {
    if (!file) return;
    setErrorMsg("");
    setUploadingBanner(true);
    try {
      const res = await uploadFile(file, { folder: "partners" });
      const url = res?.url || "";
      if (url) {
        setSettings((p) => ({ ...p, backgroundUrl: url }));
      }
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || "Upload de la bannière impossible.");
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres de la Boutique</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les informations visibles par vos clients</p>
        </div>
        {success && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <CheckCircle2 size={18} />
            Modifications enregistrées
          </motion.div>
        )}
      </div>
      {errorMsg ? (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium">
          {errorMsg}
        </div>
      ) : null}
      {loadingPage ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-500">Chargement des paramètres...</div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Branding Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Store className="text-blue-600" size={24} />
            <h2 className="text-lg font-bold text-gray-900">Identité Visuelle</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Logo</label>
              <div className="flex items-center gap-4">
                <div
                  className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 overflow-hidden relative group cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <img src={settings.logoUrl || "/imgs/logo.png"} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadingLogo ? (
                      <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Upload className="text-white" size={24} />
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <p>PNG, JPG ou SVG.</p>
                  <p>Max 2MB.</p>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="mt-2 text-blue-600 font-medium hover:underline"
                  >
                    Changer le logo
                  </button>
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleLogoPick(e.target.files?.[0])}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Bannière de couverture</label>
              <div
                className="w-full h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 cursor-pointer hover:border-blue-500 transition-colors overflow-hidden relative"
                onClick={() => bannerInputRef.current?.click()}
              >
                {settings.backgroundUrl ? (
                  <img src={settings.backgroundUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : null}
                <div className="relative flex items-center gap-2">
                  {uploadingBanner ? (
                    <span className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-500 rounded-full animate-spin" />
                  ) : (
                    <Upload size={20} />
                  )}
                  <span className="text-sm">{settings.backgroundUrl ? "Changer l'image" : "Téléverser une image"}</span>
                </div>
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleBannerPick(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique</label>
              <input 
                type="text" 
                value={settings.shopName}
                onChange={(e) => setSettings((p) => ({ ...p, shopName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description courte</label>
              <textarea 
                rows={3}
                value={settings.shopDescription}
                onChange={(e) => setSettings((p) => ({ ...p, shopDescription: e.target.value }))}
                className="bg-gray-50 w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                maxLength={150}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description complète</label>
              <textarea
                rows={4}
                value={settings.description}
                onChange={(e) => setSettings((p) => ({ ...p, description: e.target.value }))}
                className="bg-gray-50 w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie principale</label>
              <select
                value={settings.mainCategoryId}
                onChange={(e) => setSettings((p) => ({ ...p, mainCategoryId: Number(e.target.value) || p.mainCategoryId }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {(mainCategories.length > 0 ? mainCategories : [{ id: 1, name: "Mode & Accessoires" }]).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <AlertTriangle className="text-yellow-600" size={24} />
            <h2 className="text-lg font-bold text-gray-900">Préférences d'Inventaire</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seuil d'alerte de stock faible</label>
              <p className="text-sm text-gray-500 mb-4">
                Recevoir une alerte lorsque le stock d'un produit descend en dessous de ce nombre.
              </p>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  min="1"
                  max="100"
                  value={prefs.stockThreshold}
                  onChange={(e) => setPrefs((p) => ({ ...p, stockThreshold: parseInt(e.target.value || "0") }))}
                  className="w-24 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-center"
                />
                <span className="text-sm text-gray-600">unités</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <MapPin className="text-orange-600" size={24} />
            <h2 className="text-lg font-bold text-gray-900">Contact & Localisation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={settings.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="tel" 
                  value={settings.phoneNumber}
                  onChange={(e) => setSettings((p) => ({ ...p, phoneNumber: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse physique</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={settings.headOfficeAddress}
                  onChange={(e) => setSettings((p) => ({ ...p, headOfficeAddress: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                value={settings.city}
                onChange={(e) => setSettings((p) => ({ ...p, city: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <input
                type="text"
                value={settings.country}
                onChange={(e) => setSettings((p) => ({ ...p, country: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Socials & Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <Globe className="text-purple-600" size={24} />
              <h2 className="text-lg font-bold text-gray-900">Réseaux Sociaux</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Web</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="url" 
                    placeholder="https://votre-site.com"
                    value={prefs.websiteUrl}
                    onChange={(e) => setPrefs((p) => ({ ...p, websiteUrl: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="@votre_boutique"
                    value={prefs.instagramHandle}
                    onChange={(e) => setPrefs((p) => ({ ...p, instagramHandle: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Page Facebook"
                    value={prefs.facebookPage}
                    onChange={(e) => setPrefs((p) => ({ ...p, facebookPage: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <Clock className="text-teal-600" size={24} />
              <h2 className="text-lg font-bold text-gray-900">Horaires</h2>
            </div>
            <div className="space-y-3">
              {weekdays.map((day) => (
                <div key={day} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{day}</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={hours?.[day]?.open || "09:00"}
                      onChange={(e) => setHours((p) => ({ ...p, [day]: { ...(p?.[day] || {}), open: e.target.value } }))}
                      className="px-2 py-1 border border-gray-200 rounded-md bg-gray-50 text-xs"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                      type="time" 
                      value={hours?.[day]?.close || "18:00"}
                      onChange={(e) => setHours((p) => ({ ...p, [day]: { ...(p?.[day] || {}), close: e.target.value } }))}
                      className="px-2 py-1 border border-gray-200 rounded-md bg-gray-50 text-xs"
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <span className="font-medium text-red-500">Dimanche</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Fermé</label>
                  <input
                    type="checkbox"
                    checked={!!hours?.Dimanche?.closed}
                    onChange={(e) => setHours((p) => ({ ...p, Dimanche: { ...(p?.Dimanche || {}), closed: e.target.checked, open: p?.Dimanche?.open || "09:00", close: p?.Dimanche?.close || "13:00" } }))}
                  />
                </div>
              </div>
              {!hours?.Dimanche?.closed ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Dimanche</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={hours?.Dimanche?.open || "09:00"}
                      onChange={(e) => setHours((p) => ({ ...p, Dimanche: { ...(p?.Dimanche || {}), open: e.target.value } }))}
                      className="px-2 py-1 border border-gray-200 rounded-md bg-gray-50 text-xs"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="time"
                      value={hours?.Dimanche?.close || "13:00"}
                      onChange={(e) => setHours((p) => ({ ...p, Dimanche: { ...(p?.Dimanche || {}), close: e.target.value } }))}
                      className="px-2 py-1 border border-gray-200 rounded-md bg-gray-50 text-xs"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-lg flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
