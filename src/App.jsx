import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Orders from "./pages/Orders.jsx";
import Products from "./pages/Products.jsx";
import ProductCreate from "./pages/ProductCreate.jsx";
import Customers from "./pages/Customers.jsx";
import Users from "./pages/Users.jsx";
import UserDetail from "./pages/UserDetail.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import Inventory from "./pages/Inventory.jsx";
import Logistics from "./pages/Logistics.jsx";
import Marketing from "./pages/Marketing.jsx";
import Loyalty from "./pages/Loyalty.jsx";
import Finance from "./pages/Finance.jsx";
import Categories from "./pages/Categories.jsx";
import PromoCodes from "./pages/PromoCodes.jsx";
import Messages from "./pages/Messages.jsx";
import ContactRequests from "./pages/ContactRequests.jsx";
import ProductReviews from "./pages/ProductReviews.jsx";
import BlogPosts from "./pages/BlogPosts.jsx";
import TicketEvents from "./pages/TicketEvents.jsx";
import { isAuthenticated } from "./services/auth.js";

function RequireAuth({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  const authed = isAuthenticated();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/create" element={<ProductCreate />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/promo-codes" element={<PromoCodes />} />
        <Route path="/blog-posts" element={<BlogPosts />} />
        <Route path="/ticket-events" element={<TicketEvents />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/logistics" element={<Logistics />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/loyalty" element={<Loyalty />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/contacts" element={<ContactRequests />} />
        <Route path="/product-reviews" element={<ProductReviews />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to={authed ? "/" : "/login"} replace />} />
    </Routes>
  );
}
