"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  TagIcon as TagIconSolid,
} from "@heroicons/react/24/solid";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    id: "menu",
    label: "Menu Items",
    href: "/menu",
    icon: ClipboardDocumentListIcon,
    activeIcon: ClipboardDocumentListIconSolid,
  },
  {
    id: "promotions",
    label: "Promotions",
    href: "/promotions",
    icon: TagIcon,
    activeIcon: TagIconSolid,
    badge: "5",
  },
  // {
  //   id: "analytics",
  //   label: "Analytics",
  //   href: "/analytics",
  //   icon: ChartBarIcon,
  // },
  // {
  //   id: "customers",
  //   label: "Customers",
  //   href: "/customers",
  //   icon: UserGroupIcon,
  // },
  // { id: "orders", label: "Orders", href: "/orders", icon: ShoppingBagIcon },
];

const bottomMenuItems = [
  // { id: "settings", label: "Settings", href: "/settings", icon: Cog6ToothIcon },
  { id: "logout", label: "Logout", href: "#", icon: ArrowRightOnRectangleIcon },
];

export default function Sidebar() {
  const { isOpen, isMobile, closeSidebar } = useSidebar();
  const pathname = usePathname();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Don't render sidebar if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    console.log("Logout clicked");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}
      {/* Sidebar - Fixed positioned */}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isMobile ? "w-72" : "w-64"}
          flex flex-col
          shadow-lg
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              KlickCard
            </span>
          </Link>

          {isMobile && (
            <button
              onClick={closeSidebar}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              const Icon =
                active && item.activeIcon ? item.activeIcon : item.icon;

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={isMobile ? closeSidebar : undefined}
                    className={`
                      flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                      ${
                        active
                          ? "bg-primary-50 text-primary-600"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${active ? "text-primary-600" : "text-gray-500"}`}
                    />
                    <span className="ml-3 text-sm font-medium">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`
                        ml-auto px-2 py-0.5 text-xs font-medium rounded-full
                        ${active ? "bg-primary-200 text-primary-700" : "bg-gray-200 text-gray-600"}
                      `}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Items */}
        <div className="border-t border-gray-200 px-3 py-4 flex-shrink-0">
          <ul className="space-y-1">
            {bottomMenuItems.map((item) => (
              <li key={item.id}>
                {item.id === "logout" ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0 text-gray-500" />
                    <span className="ml-3 text-sm font-medium">
                      {item.label}
                    </span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={isMobile ? closeSidebar : undefined}
                    className="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0 text-gray-500" />
                    <span className="ml-3 text-sm font-medium">
                      {item.label}
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
