"use client";

import { useState } from "react";
import { useSidebar } from "@/hooks/useSidebar";
import SidebarItem from "./SidebarItem";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function SidebarCollapsible() {
  const { isOpen, toggleSidebar, isMobile } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isMobile ? "w-72" : collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Collapse Toggle (desktop only) */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50"
        >
          {collapsed ? (
            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
          )}
        </button>
      )}

      {/* ... rest of sidebar content with conditional rendering based on collapsed */}
    </aside>
  );
}
