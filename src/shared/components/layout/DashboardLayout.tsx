import { useState } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@shared/lib/cn";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/80 sm:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 shadow-2xl",
          "sm:translate-x-0 sm:static sm:flex-shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Sidebar"
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F4F7F6]">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />

        <main
          id="main"
          className="flex-1 overflow-auto px-4 sm:px-8 pb-12 pt-4"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
