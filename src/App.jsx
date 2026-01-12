import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import ScrollToTop from './assets/components/ScrollToTop'
import { Toaster } from 'sonner'
import Loader from './assets/components/Loader'

const Layout = lazy(() => import('./assets/layout/Layout.jsx'))
const OnboardingPopup = lazy(() => import('./assets/components/OnboardingPopup.jsx'))
const CookieConsent = lazy(() => import('./assets/components/CookieConsent.jsx'))
const Home = lazy(() => import('./assets/pages/Home.jsx'))
const Catalogue = lazy(() => import('./assets/pages/Catalogue.jsx'))
const Cart = lazy(() => import('./assets/pages/Cart.jsx'))
const ProductDetails = lazy(() => import('./assets/pages/ProductDetails.jsx'))
const Login = lazy(() => import('./assets/pages/Login.jsx'))
const Callback = lazy(() => import('./assets/pages/Callback.jsx')) // OIDC Callback
const Seller = lazy(() => import('./assets/pages/Seller.jsx'))
const Wishlist = lazy(() => import('./assets/pages/Wishlist.jsx'))
const Profile = lazy(() => import('./assets/pages/Profile.jsx'))
const Contact = lazy(() => import('./assets/pages/Contact.jsx'))
const Help = lazy(() => import('./assets/pages/Help.jsx'))
const FAQ = lazy(() => import('./assets/pages/FAQ.jsx'))
const Terms = lazy(() => import('./assets/pages/Terms.jsx'))
const Privacy = lazy(() => import('./assets/pages/Privacy.jsx'))
const TicketCatalog = lazy(() => import('./assets/pages/TicketCatalog.jsx'))
const SellersList = lazy(() => import('./assets/pages/SellersList.jsx'))
const SellerDetails = lazy(() => import('./assets/pages/SellerDetails.jsx'))
const OrderTracking = lazy(() => import('./assets/pages/OrderTracking.jsx'))
const Returns = lazy(() => import('./assets/pages/Returns.jsx'))
const Delivery = lazy(() => import('./assets/pages/Delivery.jsx'))

function App() {
  
  return (
    <>
      <ScrollToTop />
      <Toaster richColors closeButton position="top-center" />
      <Suspense fallback={null}>
        <OnboardingPopup />
        <CookieConsent />
      </Suspense>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/seller-join" element={<Seller />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} /> 
            <Route path="shop" element={<Catalogue />} />
            <Route path="tickets" element={<TicketCatalog />} />
            <Route path="sellers" element={<SellersList />} />
            <Route path="sellers/:id" element={<SellerDetails />} />
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
