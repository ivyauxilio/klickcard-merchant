"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/slices/authSlice";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Keep sidebar state synchronized with authentication state
  useEffect(() => {
    if (!isAuthenticated) {
      // Always close sidebar when logged out
      setIsOpen(false);
    }
  }, [isAuthenticated]);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);

      if (!isAuthenticated) {
        setIsOpen(false);
        return;
      }

      // Authenticated desktop users get an open sidebar
      if (!mobile) {
        setIsOpen(true);
      } else {
        // Mobile starts closed
        setIsOpen(false);
      }
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [isAuthenticated]);

  const toggleSidebar = () => {
    if (!isAuthenticated) {
      setIsOpen(false);
      return;
    }

    setIsOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const openSidebar = () => {
    if (!isAuthenticated) {
      setIsOpen(false);
      return;
    }

    if (!isMobile) {
      setIsOpen(true);
    }
  };

  // This prevents consumers from accidentally treating the sidebar
  // as open while the user is logged out.
  const sidebarIsOpen = isAuthenticated && isOpen;

  return (
    <SidebarContext.Provider
      value={{
        isOpen: sidebarIsOpen,
        isMobile,
        isAuthenticated,
        toggleSidebar,
        closeSidebar,
        openSidebar,
        setIsOpen: (value) => {
          if (!isAuthenticated) {
            setIsOpen(false);
            return;
          }

          setIsOpen(value);
        },
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
}
