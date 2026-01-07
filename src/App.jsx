import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import ScrollToTop from './assets/components/ScrollToTop'
import OnboardingPopup from './assets/components/OnboardingPopup.jsx'
import { Toaster } from 'sonner'

const Layout = lazy(() => import('./assets/layout/Layout.jsx'))
const Home = lazy(() => import('./assets/pages/Home.jsx'))
const Catalogue = lazy(() => import('./assets/pages/Catalogue.jsx'))
const Cart = lazy(() => import('./assets/pages/Cart.jsx'))
const ProductDetails = lazy(() => import('./assets/pages/ProductDetails.jsx'))
const Login = lazy(() => import('./assets/pages/Login.jsx'))
const Seller = lazy(() => import('./assets/pages/Seller.jsx'))
const Wishlist = lazy(() => import('./assets/pages/Wishlist.jsx'))

function App() {
  
  return (
    <>
      <ScrollToTop />
      <OnboardingPopup />
      <Toaster richColors closeButton position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/seller-join" element={<Seller />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} /> 
          <Route path="shop" element={<Catalogue />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="product/:id" element={<ProductDetails />} />
        </Route>
      </Routes>
    </>
  )
}
// home - ok 
// login - ok 
// login-seller - ok
// shop - 
// cart - 
// wishlist - 
// product details - 
// layout - ok
export default App
