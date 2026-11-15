import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import ApiStatusBubble from "./components/layout/ApiStatusBubble.jsx";
import Layout from "./components/layout/Layout.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import ReturnsLayout from "./pages/returns/ReturnsLayout.jsx";
import ReturnRequestsPage from "./pages/returns/ReturnRequestsPage.jsx";
import ReturnRefundsPage from "./pages/returns/ReturnRefundsPage.jsx";
import ReturnPolicyPage from "./pages/returns/ReturnPolicyPage.jsx";
import Products from "./pages/Products.jsx";
import ProductCreate from "./pages/ProductCreate.jsx";
import Media from "./pages/Media.jsx";
import Partners from "./pages/Partners.jsx";
import Customers from "./pages/Customers.jsx";
import Users from "./pages/Users.jsx";
import UserDetail from "./pages/UserDetail.jsx";
import Analytics from "./pages/Analytics.jsx";
import SettingsLayout from "./pages/settings/SettingsLayout.jsx";
import ShopSettings from "./pages/settings/ShopSettings.jsx";
import PayoutsSettings from "./pages/settings/PayoutsSettings.jsx";
import SocialLinksSettings from "./pages/settings/SocialLinksSettings.jsx";
import Couriers from "./pages/Couriers.jsx";
import TeamSettings from "./pages/settings/TeamSettings.jsx";
import NotificationsSettings from "./pages/settings/NotificationsSettings.jsx";
import SecuritySettings from "./pages/settings/SecuritySettings.jsx";
import { DEFAULT_SETTINGS_SECTION } from "./pages/settings/sections.js";
import Inventory from "./pages/Inventory.jsx";
import LogisticsLayout, { LogisticsLegacyRedirect } from "./pages/logistics/LogisticsLayout.jsx";
import LogisticsOverviewPage from "./pages/logistics/LogisticsOverviewPage.jsx";
import LogisticsShipmentsPage from "./pages/logistics/LogisticsShipmentsPage.jsx";
import LogisticsCollectionsPage from "./pages/logistics/LogisticsCollectionsPage.jsx";
import LogisticsPricingPage from "./pages/logistics/LogisticsPricingPage.jsx";
import Marketing from "./pages/Marketing.jsx";
import Loyalty from "./pages/Loyalty.jsx";
import Finance from "./pages/Finance.jsx";
import Invoices from "./pages/Invoices.jsx";
import Categories from "./pages/Categories.jsx";
import PromoCodes from "./pages/PromoCodes.jsx";
import ContactLayout from "./pages/contact/ContactLayout.jsx";
import ContactInbox from "./pages/contact/ContactInbox.jsx";
import ContactCompose from "./pages/contact/ContactCompose.jsx";
import ContactHistory from "./pages/contact/ContactHistory.jsx";
import { DEFAULT_CONTACT_SECTION } from "./pages/contact/sections.js";
import ProductReviews from "./pages/ProductReviews.jsx";
import BlogPosts from "./pages/BlogPosts.jsx";
import ProductNotFound from "./pages/ProductNotFound.jsx";
import { isAuthenticated } from "./services/auth.js";
import { OverviewProvider } from "./contexts/OverviewContext.jsx";
import TestLabel from "./pages/Test.jsx";

function RequireAuth({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function OverviewSection() {
  return (
    <OverviewProvider>
      <Outlet />
    </OverviewProvider>
  );
}

export default function App() {
  const authed = isAuthenticated();

  return (
    <>
    <ApiStatusBubble />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route element={<OverviewSection />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:reference" element={<OrderDetail />} />
        <Route path="/returns" element={<ReturnsLayout />}>
          <Route index element={<ReturnRequestsPage />} />
          <Route path="remboursements" element={<ReturnRefundsPage />} />
          <Route path="politique" element={<ReturnPolicyPage />} />
          <Route path="*" element={<Navigate to="/returns" replace />} />
        </Route>
        <Route path="/partners" element={<Partners />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/create" element={<ProductCreate />} />
        <Route path="/products/:id" element={<ProductNotFound />} />
        <Route path="/media" element={<Media />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/promo-codes" element={<PromoCodes />} />
        <Route path="/blog-posts" element={<BlogPosts />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/couriers" element={<Couriers />} />
        <Route path="/inventory" element={<Inventory />} />
        {/* Livraison : sous-pages (SubPageLayout) ; /logistics?… et anciennes URL redirigées, paramètres conservés */}
        <Route path="/logistics" element={<LogisticsLayout />}>
          <Route index element={<LogisticsLegacyRedirect />} />
          <Route path="overview" element={<LogisticsOverviewPage />} />
          <Route path="shipments" element={<LogisticsShipmentsPage />} />
          <Route path="history" element={<LogisticsShipmentsPage />} />
          <Route path="collections" element={<LogisticsCollectionsPage />} />
          <Route path="pricing/*" element={<LogisticsPricingPage />} />
          <Route path="suivi" element={<LogisticsLegacyRedirect />} />
          <Route path="*" element={<Navigate to="/logistics/overview" replace />} />
        </Route>
        <Route path="/delivery-board" element={<LogisticsLegacyRedirect />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/loyalty" element={<Loyalty />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/partner-subscriptions" element={<Navigate to="/" replace />} />
        <Route path="/contact" element={<ContactLayout />}>
          <Route index element={<Navigate to={DEFAULT_CONTACT_SECTION} replace />} />
          <Route path="inbox" element={<ContactInbox />} />
          <Route path="inbox/:id" element={<ContactInbox />} />
          <Route path="envoyer" element={<ContactCompose />} />
          <Route path="historique" element={<ContactHistory />} />
          <Route path="*" element={<Navigate to={DEFAULT_CONTACT_SECTION} replace />} />
        </Route>
        {/* Anciennes pages Messages et Contacts fusionnées dans /contact */}
        <Route path="/messages" element={<Navigate to="/contact/historique" replace />} />
        <Route path="/contacts" element={<Navigate to="/contact/inbox" replace />} />
        <Route path="/product-reviews" element={<ProductReviews />} />
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to={DEFAULT_SETTINGS_SECTION} replace />} />
          <Route path="boutique" element={<ShopSettings />} />
          <Route path="reversements" element={<PayoutsSettings />} />
          <Route path="retours-commissions" element={<Navigate to="/returns/politique" replace />} />
          {/* Tarification de livraison déplacée dans Livraison > Tarification */}
          <Route path="livraison" element={<Navigate to="/logistics/pricing" replace />} />
          <Route path="livraison/*" element={<Navigate to="/logistics/pricing" replace />} />
          <Route path="reseaux-sociaux" element={<SocialLinksSettings />} />
          <Route path="livreurs" element={<Navigate to="/couriers" replace />} />
          <Route path="equipe" element={<TeamSettings />} />
          <Route path="notifications" element={<NotificationsSettings />} />
          <Route path="securite" element={<SecuritySettings />} />
          <Route path="*" element={<Navigate to={DEFAULT_SETTINGS_SECTION} replace />} />
        </Route>
      </Route>
        <Route path="/test-label" element={<TestLabel />} />
      <Route path="*" element={<Navigate to={authed ? "/" : "/login"} replace />} />
    </Routes>
    </>
  );
}
