"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  logoutUser,
  selectAuthLoading,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";
import { useSidebar } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { addNotification } from "@/store/slices/uiSlice";

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toggleSidebar, isMobile } = useSidebar();
  const pathname = usePathname();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { user } = useSelector((state) => state.auth);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fullName = [user?.firstname, user?.lastname].filter(Boolean).join(" ");

  const initials = [user?.firstname, user?.lastname]
    .filter(Boolean)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  const getPageTitle = () => {
    const segments = pathname?.split("/").filter(Boolean) || [];
    if (segments.length === 0) return "Dashboard";
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    console.log("useeffect logout");
    if (isLoggingOut && !isAuthenticated) {
      router.push("/login");
      router.refresh();
    }
  }, [isAuthenticated, isLoggingOut, router]);

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutUser()).unwrap();

      setIsLoggingOut(true);
      // Show success notification
      dispatch(
        addNotification({
          type: "success",
          message: "Logged out successfully",
        }),
      );
      // Redirect to login page
      window.location.href = "/login";
      router.push("/login");
      router.refresh(); // Force refresh to clear server-side state
    } catch (error) {
      // Even if API fails, we still redirect
      dispatch(
        addNotification({
          type: "warning",
          message: error || "Logged out, but API call failed",
        }),
      );
      window.location.href = "/login";
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Only show hamburger on mobile */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <BellIcon className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {initials}
                </span>
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {user?.email ? `${user?.email}` : "No Email"}
              </span>
              <ChevronDownIcon className="hidden md:block w-4 h-4 text-gray-500" />
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      admin@example.com
                    </p>
                    <p className="text-xs text-gray-500">
                      {fullName ? ` ${fullName}` : ""}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <UserCircleIcon className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </header>
  );
}
