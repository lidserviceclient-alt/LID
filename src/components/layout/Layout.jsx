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
import { subscribeFrontendRealtime } from '@/services/realtimeService'

export default function Layout() {
  const location = useLocation();
  const isHomeRoute = location.pathname === '/';
  const hideFooter = location.pathname === '/cart';
  const {
    data: globalCollection,
    isLoading: isGlobalCollectionLoading,
    isFetched: isGlobalCollectionFetched,
    error: globalCollectionError,
    refetch: refetchGlobalCollection,
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
    if (!isHomeRoute) return;
    let refreshInFlight = false;
    let queuedRefresh = false;
    let lastRefreshAt = 0;
    let throttleTimer = null;

    const refreshCollection = () => {
      if (refreshInFlight) {
        queuedRefresh = true;
        return;
      }
      refreshInFlight = true;
      refetchGlobalCollection().then((result) => {
        const next = result?.data;
        if (next) {
          setGlobalCollectionState(next);
        }
      }).catch(() => {}).finally(() => {
        refreshInFlight = false;
        if (queuedRefresh) {
          queuedRefresh = false;
          refreshCollection();
        }
      });
    };

    const unsubscribe = subscribeFrontendRealtime((event) => {
      const topic = `${event?.topic || ''}`.trim();
      if (topic !== 'catalog.updated') {
        return;
      }
      const now = Date.now();
      const minGapMs = 1200;
      const elapsed = now - lastRefreshAt;
      if (elapsed >= minGapMs) {
        lastRefreshAt = now;
        refreshCollection();
        return;
      }
      if (throttleTimer) {
        return;
      }
      throttleTimer = window.setTimeout(() => {
        throttleTimer = null;
        lastRefreshAt = Date.now();
        refreshCollection();
      }, minGapMs - elapsed);
    }, ['catalog.updated']);
    return () => {
      if (throttleTimer) {
        window.clearTimeout(throttleTimer);
      }
      unsubscribe();
    };
  }, [isHomeRoute, refetchGlobalCollection]);

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
              {hideFooter ? null : <Footer />}
            </div>
          </CatalogBootstrapProvider>
        </WishlistProvider>
      </CustomerSessionProvider>
    </CartProvider>
  )
}
