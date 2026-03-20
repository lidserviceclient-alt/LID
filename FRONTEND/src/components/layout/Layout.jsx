import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '../CartDrawer'
import { CartProvider } from '@/features/cart/CartContext'
import { WishlistProvider } from '@/features/wishlist/WishlistContext'
import { useEffect } from 'react'
import Lenis from 'lenis'

export default function Layout() {
  const location = useLocation();

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
      <WishlistProvider>
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
      </WishlistProvider>
    </CartProvider>
  )
}
