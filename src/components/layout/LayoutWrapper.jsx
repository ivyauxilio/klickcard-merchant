"use client";

import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { selectSidebarOpen } from "@/store/slices/uiSlice";

import SessionInit from "@/components/SessionInit";
import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";
// import Header from "@/components/Navbar";
import Header from "@/components/layout/Header";
import Notification from "@/components/ui/Notification";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isSelectSidebarOpen = useSelector(selectSidebarOpen);

  // Check if current route is auth page
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  // Don't show layout components on auth pages or when not authenticated
  const showLayout = !isAuthPage && isAuthenticated;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {showLayout && <Sidebar />}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden ${showLayout ? "md:ml-64" : ""}`}
      >
        {showLayout && <Header />}
        <SessionInit />
        <main
          className={`flex-1 overflow-y-auto ${showLayout ? "p-4 md:p-6" : "p-0"}`}
        >
          {children}
        </main>
      </div>
      <Notification />
    </div>
  );
}
