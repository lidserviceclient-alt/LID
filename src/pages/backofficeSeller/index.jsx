import { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Menu, X, Layers, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyPartnerCollection } from '@/services/partnerBackofficeDashboardService';
import { getMyPartnerSettingsCollection } from '@/services/partnerBackofficeSettingsService';
import { listMyProducts } from '@/services/partnerBackofficeProductService';
import { listMyOrders } from '@/services/partnerBackofficeOrderService';
import { getMyCategoriesCollection } from '@/services/partnerBackofficeCategoryService';
import { PartnerBackofficeBootstrapProvider } from '@/features/partnerBackoffice/PartnerBackofficeBootstrapContext';

export default function SellerBackoffice() {
  const [pageTitle, setPageTitle] = useState("Tableau de bord");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const routeKey = useMemo(() => {
    const parts = `${location.pathname || ''}`.split('/').filter(Boolean);
    const selOffIndex = parts.indexOf('sel-off');
    return selOffIndex >= 0 ? (parts[selOffIndex + 1] || 'dashboard') : 'dashboard';
  }, [location.pathname]);

  const MENU_ITEMS = useMemo(() => ([
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: 'dashboard' },
    { id: 'products', label: 'Produits', icon: Package, path: 'products' },
    { id: 'categories', label: 'Catégories', icon: Layers, path: 'categories' },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag, path: 'orders' },
    { id: 'settings', label: 'Paramètres', icon: Settings, path: 'settings' },
  ]), []);

  useEffect(() => {
    const parts = `${location.pathname || ''}`.split('/').filter(Boolean);
    const selOffIndex = parts.indexOf('sel-off');
    const active = selOffIndex >= 0 ? parts[selOffIndex + 1] : null;
    const currentId = active || 'dashboard';
    const match = MENU_ITEMS.find((m) => m.id === currentId);
    const nextTitle = match?.label || "Lid partenaire | Tableau de bord";
    const shortTitle = `${nextTitle}`.split("|").slice(-1)[0].trim() || "Tableau de bord";
    setPageTitle(shortTitle);
    document.title = nextTitle;
  }, [location.pathname, MENU_ITEMS]);

  const settingsCollectionQuery = useQuery({
    queryKey: ['partner-backoffice-settings-collection'],
    queryFn: () => getMyPartnerSettingsCollection(),
    enabled: routeKey === 'dashboard' || routeKey === 'settings',
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    retry: 1,
  });

  const categoriesCollectionQuery = useQuery({
    queryKey: ['partner-backoffice-categories-collection'],
    queryFn: () => getMyCategoriesCollection(),
    enabled: routeKey === 'settings' || routeKey === 'categories',
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    retry: 1,
  });

  const bootstrapQuery = useQuery({
    queryKey: ['partner-backoffice-bootstrap', routeKey],
    queryFn: async () => {
      if (routeKey === 'dashboard') {
        return {
          collection: await getMyPartnerCollection({ productLimit: 200, orderLimit: 50, customerLimit: 20 }),
        };
      }
      if (routeKey === 'settings') {
        return null;
      }
      if (routeKey === 'products') {
        return await listMyProducts({ page: 0, size: 200 });
      }
      if (routeKey === 'orders') {
        return await listMyOrders({ page: 0, size: 200 });
      }
      if (routeKey === 'categories') {
        return null;
      }
      return null;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    retry: 1,
  });

  const bootstrapValue = useMemo(() => ({
    routeKey,
    data: bootstrapQuery.data || null,
    isLoading: bootstrapQuery.isLoading,
    isResolved: Boolean(bootstrapQuery.isFetched || bootstrapQuery.error),
    error: bootstrapQuery.error || null,
    settingsCollection: settingsCollectionQuery.data || null,
    isSettingsCollectionLoading: settingsCollectionQuery.isLoading,
    isSettingsCollectionResolved: Boolean(settingsCollectionQuery.isFetched || settingsCollectionQuery.error),
    settingsCollectionError: settingsCollectionQuery.error || null,
    categoriesCollection: categoriesCollectionQuery.data || null,
    isCategoriesCollectionLoading: categoriesCollectionQuery.isLoading,
    isCategoriesCollectionResolved: Boolean(categoriesCollectionQuery.isFetched || categoriesCollectionQuery.error),
    categoriesCollectionError: categoriesCollectionQuery.error || null,
  }), [
    bootstrapQuery.data,
    bootstrapQuery.error,
    bootstrapQuery.isFetched,
    bootstrapQuery.isLoading,
    routeKey,
    settingsCollectionQuery.data,
    settingsCollectionQuery.error,
    settingsCollectionQuery.isFetched,
    settingsCollectionQuery.isLoading,
    categoriesCollectionQuery.data,
    categoriesCollectionQuery.error,
    categoriesCollectionQuery.isFetched,
    categoriesCollectionQuery.isLoading,
  ]);

  return (
    <PartnerBackofficeBootstrapProvider value={bootstrapValue}>
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 overflow-hidden rounded-lg flex items-center justify-center text-white font-bold">
              <img src="/imgs/logo_partener.png" alt="LID Partner" className="w-full h-full" />
            </div>
            <span className="font-bold text-lg tracking-tight">Lid 
partenaire </span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-black text-white shadow-lg shadow-black/20' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'} />
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <NavLink
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors group"
          >
            <Home size={20} className="text-gray-400 group-hover:text-gray-900" />
            <span className="font-medium text-sm">Accueil</span>
          </NavLink>
          <NavLink
            to="/profile"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors group"
          >
            <Home size={20} className="text-gray-400 group-hover:text-gray-900" />
            <span className="font-medium text-sm">Profil</span>
          </NavLink>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={20} />
            <span className="font-medium text-sm">Sortie</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500">
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg">LID Partner</span>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
    </PartnerBackofficeBootstrapProvider>
  );
}
