import { Suspense, lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import { Toaster } from 'sonner'
import Loader from './components/Loader'
import ProtectedRoute from './routes/ProtectedRoute'

const Layout = lazy(() => import('./components/layout/Layout.jsx'))
const OnboardingPopup = lazy(() => import('./components/OnboardingPopup.jsx'))
const CookieConsent = lazy(() => import('./components/CookieConsent.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const Catalogue = lazy(() => import('./pages/Catalogue.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const ProductDetails = lazy(() => import('./pages/ProductDetailsDb.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Callback = lazy(() => import('./pages/Callback.jsx')) // OIDC Callback
const Seller = lazy(() => import('./pages/Seller.jsx'))
const BackofficeSeller = lazy(() => import('./pages/backofficeSeller/index'))
const BackofficeDashboard = lazy(() => import('./pages/backofficeSeller/Dashboard'))
const BackofficeProducts = lazy(() => import('./pages/backofficeSeller/ProductManagement'))
const BackofficeMedia = lazy(() => import('./pages/backofficeSeller/Media'))
const BackofficeOrders = lazy(() => import('./pages/backofficeSeller/Orders'))
const BackofficeCategories = lazy(() => import('./pages/backofficeSeller/Categories'))
const BackofficeSettings = lazy(() => import('./pages/backofficeSeller/Settings'))
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess.jsx'))
const PaymentCancel = lazy(() => import('./pages/PaymentCancel.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Help = lazy(() => import('./pages/Help.jsx'))
const FAQ = lazy(() => import('./pages/FAQ.jsx'))
const Terms = lazy(() => import('./pages/Terms.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const TicketCatalog = lazy(() => import('./pages/TicketCatalog.jsx'))
const TicketDetails = lazy(() => import('./pages/TicketDetails.jsx'))
const Blog = lazy(() => import('./pages/Blog.jsx'))
const BlogDetails = lazy(() => import('./pages/BlogDetails.jsx'))
const SellersList = lazy(() => import('./pages/SellersList.jsx'))
const SellerDetails = lazy(() => import('./pages/SellerDetails.jsx'))
const OrderTracking = lazy(() => import('./pages/OrderTracking.jsx'))
const Returns = lazy(() => import('./pages/Returns.jsx'))
const Delivery = lazy(() => import('./pages/Delivery.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const Test = lazy(() => import('./pages/Test.jsx'))



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
          <Route path="/seller-joint" element={<Seller />} />
          
          <Route
            path="/sel-off"
            element={
              <ProtectedRoute requiredRoles={["PARTNER"]} requireVerifiedPartner>
                <BackofficeSeller />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="products" element={<BackofficeProducts />} />
            <Route path="media" element={<BackofficeMedia />} />
            <Route path="categories" element={<BackofficeCategories />} />
            <Route path="dashboard" element={<BackofficeDashboard />} />
            <Route path="orders" element={<BackofficeOrders />} />
            <Route path="settings" element={<BackofficeSettings />} />
          </Route>
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} /> 
            <Route path="shop" element={<Catalogue />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:id" element={<BlogDetails />} />
            <Route path="tickets" element={<TicketCatalog />} />
            <Route path="tickets/:id" element={<TicketDetails />} />

            {/**/} 
            <Route path="sellers" element={<SellersList />} />
            <Route path="sellers/:id" element={<SellerDetails />} /> 
            
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="payment/success" element={<PaymentSuccess />} />
            <Route path="payment/cancel" element={<PaymentCancel />} />
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
          <Route path="*" element={<NotFound />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </Suspense>
    </>
  )
}
export default App
