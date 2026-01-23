import { useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import Overview from "./pages/Overview";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "overview" && <Overview />}
      {activeTab === "products" && <Products />}
      {activeTab === "orders" && <Orders />}
      {activeTab === "customers" && <Customers />}
      {activeTab === "settings" && <Settings />}
    </DashboardLayout>
  );
}
