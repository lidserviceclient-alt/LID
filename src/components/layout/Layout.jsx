import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '../CartDrawer'
import { CartProvider } from '@/features/cart/CartContext'
import { WishlistProvider } from '@/features/wishlist/WishlistContext'
import { CustomerSessionProvider } from '@/features/customerSession/CustomerSessionContext'
import { useEffect, useMemo, useState } from 'react'
import Lenis from 'lenis'
import { useCatalogCollection } from '@/features/catalog/useCatalogCollection'
import { CatalogBootstrapProvider } from '@/features/catalog/CatalogBootstrapContext'
import { getFeaturedCatalogProducts, getLatestCatalogProducts } from '@/services/productService'

export default function Layout() {
  const location = useLocation();
  const isHomeRoute = location.pathname === '/';
  const {
    data: globalCollection,
    isLoading: isGlobalCollectionLoading,
    isFetched: isGlobalCollectionFetched,
    error: globalCollectionError,
  } = useCatalogCollection({
    featuredCategoryLimit: 6,
    featuredLimit: 12,
    bestSellerLimit: 12,
    latestLimit: 30,
    postsLimit: 100,
    ticketsLimit: 100,
    partnersPage: 0,
    partnersSize: 100,
    page: 0,
    size: 80,
  });
  const [globalCollectionState, setGlobalCollectionState] = useState(null);

  useEffect(() => {
    if (globalCollection) {
      setGlobalCollectionState(globalCollection);
    }
  }, [globalCollection]);

  useEffect(() => {
    if (!isHomeRoute || !globalCollectionState) return;

    let cancelled = false;

    const refreshFeatured = async () => {
      try {
        const list = await getFeaturedCatalogProducts(1);
        if (cancelled) return;
        const featured = Array.isArray(list) ? list : [];
        setGlobalCollectionState((prev) => {
          if (!prev) return prev;
          const current = Array.isArray(prev.featuredProducts) ? prev.featuredProducts : [];
          const nextFirst = featured[0];
          if (!nextFirst) return prev;
          if (current[0]?.id === nextFirst.id) return prev;
          return {
            ...prev,
            featuredProducts: [nextFirst, ...current.filter((item) => item?.id && item.id !== nextFirst.id)],
          };
        });
      } catch {
      }
    };

    const refreshLatest = async () => {
      try {
        const list = await getLatestCatalogProducts(30);
        if (cancelled) return;
        const latest = Array.isArray(list) ? list : [];
        setGlobalCollectionState((prev) => {
          if (!prev) return prev;
          const current = Array.isArray(prev.latestProducts) ? prev.latestProducts : [];
          if (
            current.length === latest.length &&
            current.every((item, index) => item?.id === latest[index]?.id)
          ) {
            return prev;
          }
          return { ...prev, latestProducts: latest };
        });
      } catch {
      }
    };

    const featuredTimer = window.setInterval(refreshFeatured, 30_000);
    const latestTimer = window.setInterval(refreshLatest, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(featuredTimer);
      window.clearInterval(latestTimer);
    };
  }, [globalCollectionState, isHomeRoute]);

  const bootstrapValue = useMemo(() => ({
    isHomeRoute,
    pathname: location.pathname,
    globalCollection: globalCollectionState,
    isGlobalCollectionLoading,
    isGlobalCollectionResolved: Boolean(isGlobalCollectionFetched || globalCollectionError),
    globalCollectionError,
    updateGlobalCollection: (updater) => {
      setGlobalCollectionState((prev) => {
        if (typeof updater === 'function') {
          return updater(prev);
        }
        return updater;
      });
    },
  }), [globalCollectionError, globalCollectionState, isGlobalCollectionFetched, isGlobalCollectionLoading, isHomeRoute, location.pathname]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Scroll to top on route change (Lenis specific handling if needed, but ScrollToTop component usually handles window.scrollTo)
  // However, Lenis might interfere with instant scroll to top.
  useEffect(() => {
     window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <CartProvider>
      <CustomerSessionProvider>
        <WishlistProvider>
          <CatalogBootstrapProvider
            value={bootstrapValue}
          >
            <div className="app-container w-screen bg-white dark:bg-neutral-950 min-h-screen flex flex-col relative">
              {/* Header global */}
              <Header />
              
              <CartDrawer />

              {/* Contenu dynamique des pages */}
              <main className="main-content flex-1">
                <Outlet />
              </main>

              {/* Footer global */}
              <Footer />
            </div>
          </CatalogBootstrapProvider>
        </WishlistProvider>
      </CustomerSessionProvider>
    </CartProvider>
  )
}
