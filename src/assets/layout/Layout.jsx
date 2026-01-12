import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '../components/CartDrawer'
import { CartProvider } from '../provider/CartContext'
import { WishlistProvider } from '../provider/WishlistContext'

export default function Layout() {
  return (
    <CartProvider>
      <WishlistProvider>
        <div className="app-container w-screen bg-white dark:bg-neutral-950 min-h-screen flex flex-col">
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
