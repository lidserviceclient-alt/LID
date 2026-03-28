import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { cn } from "../../utils/cn.js";
import { NotificationsProvider } from "../../contexts/NotificationsContext.jsx";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className={cn("lg:pl-72 flex flex-col min-h-screen transition-all duration-300 ease-in-out")}>
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 px-6 py-6 max-w-[1500px] mx-auto w-full animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationsProvider>
  );
}
