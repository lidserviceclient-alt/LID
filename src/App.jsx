import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Orders from "./pages/Orders.jsx";
import Products from "./pages/Products.jsx";
import Customers from "./pages/Customers.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import Inventory from "./pages/Inventory.jsx";
import Logistics from "./pages/Logistics.jsx";
import Marketing from "./pages/Marketing.jsx";
import Loyalty from "./pages/Loyalty.jsx";
import Finance from "./pages/Finance.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/logistics" element={<Logistics />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/loyalty" element={<Loyalty />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
