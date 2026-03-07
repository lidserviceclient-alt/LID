import { useState } from 'react';
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

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stockThreshold, setStockThreshold] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
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
                <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 overflow-hidden relative group cursor-pointer hover:border-blue-500 transition-colors">
                  <img src="/imgs/logo.png" alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="text-white" size={24} />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <p>PNG, JPG ou SVG.</p>
                  <p>Max 2MB.</p>
                  <button type="button" className="mt-2 text-blue-600 font-medium hover:underline">Changer le logo</button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Bannière de couverture</label>
              <div className="w-full h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 cursor-pointer hover:border-blue-500 transition-colors">
                <div className="flex items-center gap-2">
                  <Upload size={20} />
                  <span className="text-sm">Téléverser une image</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique</label>
              <input 
                type="text" 
                defaultValue="Lid Partner Store"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description courte</label>
              <textarea 
                rows={3}
                defaultValue="Une boutique exceptionnelle proposant les meilleurs produits pour nos clients exigeants."
                className="bg-gray-50 w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                maxLength={150}
              />
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
                  value={stockThreshold}
                  onChange={(e) => setStockThreshold(parseInt(e.target.value))}
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
                  defaultValue="contact@lidpartner.com"
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
                  defaultValue="+225 07 00 00 00 00"
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
                  defaultValue="Cocody Riviera 2, Abidjan, Côte d'Ivoire"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
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
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((day) => (
                <div key={day} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{day}</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      defaultValue="09:00"
                      className="px-2 py-1 border border-gray-200 rounded-md bg-gray-50 text-xs"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                      type="time" 
                      defaultValue="18:00"
                      className="px-2 py-1 border border-gray-200 rounded-md bg-gray-50 text-xs"
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <span className="font-medium text-red-500">Dimanche</span>
                <span className="text-gray-500 italic text-xs">Fermé</span>
              </div>
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
