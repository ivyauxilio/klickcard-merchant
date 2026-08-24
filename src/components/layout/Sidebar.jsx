"use client";

import { useState } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { merchantCardAPI } from "@/lib/merchantCards";
import { addNotification } from "@/store/slices/uiSlice";
import Link from "next/link";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  QrCodeIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  CameraIcon,
  XCircleIcon,
  CheckCircleIcon,
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

// Dynamically import the QRScanner component with no SSR
const QRScanner = dynamic(() => import("@/components/QRScanner"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg p-4 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
      <p className="mt-2 text-sm text-gray-600">Loading scanner...</p>
    </div>
  ),
});

const bottomMenuItems = [
  // { id: "settings", label: "Settings", href: "/settings", icon: Cog6ToothIcon },
  { id: "logout", label: "Logout", href: "#", icon: ArrowRightOnRectangleIcon },
];
// interface SidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }
export default function Sidebar() {
  const { isOpen, isMobile, closeSidebar } = useSidebar();
  const pathname = usePathname();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const router = useRouter();
  const dispatch = useDispatch();
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

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

  const handleScanSuccess = async (decodedText) => {
    setScanning(true);
    setScanError(null);

    try {
      const response = await merchantCardAPI.scanCard(decodedText);

      if (response.success) {
        setScanResult(response.data);
        dispatch(
          addNotification({
            type: "success",
            message: "Card verified successfully!",
          }),
        );

        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      } else {
        setScanError(response.message || "Failed to scan card.");
        if (navigator.vibrate) {
          navigator.vibrate([100, 100, 100]);
        }
      }
    } catch (error) {
      setScanError(
        error.response?.data?.message ||
          "Failed to scan card. Please try again.",
      );
      if (navigator.vibrate) {
        navigator.vibrate([100, 100, 100]);
      }
    } finally {
      setScanning(false);
    }
  };

  const handleScanError = (error) => {
    console.log("Scan error:", error);
  };

  const closeScanner = () => {
    setShowScanner(false);
    setScanResult(null);
    setScanError(null);
  };

  const openScanner = () => {
    setScanResult(null);
    setScanError(null);
    setShowScanner(true);
    // Close sidebar on mobile when scanner opens
    // if (window.innerWidth < 768) {
    //   onClose();
    // }
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
          <div className="my-4 border-t border-gray-200" />

          {/* QR Scanner Button */}
          <button
            onClick={openScanner}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            <CameraIcon className="w-5 h-5" />
            <span className="font-medium">Scan Customer Card</span>
          </button>

          {/* Scanner Status */}
          {showScanner && (
            <div className="mt-4">
              <QRScanner
                isOpen={showScanner}
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
                onClose={closeScanner}
              />
            </div>
          )}

          {/* Scan Result */}
          {scanResult && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800">
                    Card Verified!
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-700">
                      <span className="text-gray-500">Customer:</span>{" "}
                      {scanResult.user.full_name}
                    </p>
                    <p className="text-gray-700">
                      <span className="text-gray-500">Card:</span>{" "}
                      {scanResult.card.card_number}
                    </p>
                    <p className="text-gray-700">
                      <span className="text-gray-500">Points:</span>{" "}
                      {scanResult.card.points}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setScanResult(null);
                      setShowScanner(false);
                    }}
                    className="mt-2 text-sm text-green-700 hover:text-green-800 font-medium"
                  >
                    Clear Result
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scan Error */}
          {scanError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-800">
                    Scan Failed
                  </p>
                  <p className="text-sm text-red-600 mt-1">{scanError}</p>
                  <button
                    onClick={() => setScanError(null)}
                    className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
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
