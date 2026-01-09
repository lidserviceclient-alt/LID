import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import ScrollToTop from './assets/components/ScrollToTop'
import OnboardingPopup from './assets/components/OnboardingPopup.jsx'
import { Toaster } from 'sonner'

import CookieConsent from './assets/components/CookieConsent.jsx'

const Layout = lazy(() => import('./assets/layout/Layout.jsx'))
const Home = lazy(() => import('./assets/pages/Home.jsx'))
const Catalogue = lazy(() => import('./assets/pages/Catalogue.jsx'))
const Cart = lazy(() => import('./assets/pages/Cart.jsx'))
const ProductDetails = lazy(() => import('./assets/pages/ProductDetails.jsx'))
const Login = lazy(() => import('./assets/pages/Login.jsx'))
const Seller = lazy(() => import('./assets/pages/Seller.jsx'))
const Wishlist = lazy(() => import('./assets/pages/Wishlist.jsx'))
const Profile = lazy(() => import('./assets/pages/Profile.jsx'))
const Contact = lazy(() => import('./assets/pages/Contact.jsx'))
const Help = lazy(() => import('./assets/pages/Help.jsx'))
const FAQ = lazy(() => import('./assets/pages/FAQ.jsx'))
const Terms = lazy(() => import('./assets/pages/Terms.jsx'))
const Privacy = lazy(() => import('./assets/pages/Privacy.jsx'))
import OrderTracking from './assets/pages/OrderTracking.jsx'
import Returns from './assets/pages/Returns.jsx'
import Delivery from './assets/pages/Delivery.jsx'

function App() {
  
  return (
    <>
      <ScrollToTop />
      <OnboardingPopup />
      <CookieConsent />
      <Toaster richColors closeButton position="top-center" />
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen w-screen bg-white dark:bg-neutral-950">
          <div className="w-10 h-10 border-4 border-neutral-200 dark:border-neutral-800 border-t-[#6aa200] rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/seller-join" element={<Seller />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} /> 
            <Route path="shop" element={<Catalogue />} />
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="profile" element={<Profile />} />
            <Route path="contact" element={<Contact />} />
            <Route path="help" element={<Help />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="tracking" element={<OrderTracking />} />
            <Route path="returns" element={<Returns />} />
            <Route path="delivery" element={<Delivery />} />
            <Route path="product/:id" element={<ProductDetails />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
export default App
