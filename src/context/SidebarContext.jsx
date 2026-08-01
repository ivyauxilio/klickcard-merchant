"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/slices/authSlice";

const SidebarContext = createContext({});

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Debug logging
  useEffect(() => {
    console.log("SidebarContext - isAuthenticated:", isAuthenticated);
    console.log("SidebarContext - isOpen:", isOpen);
    console.log("SidebarContext - isMobile:", isMobile);
  }, [isAuthenticated, isOpen, isMobile]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Only open on desktop when authenticated
      if (!mobile && isAuthenticated) {
        console.log("Opening sidebar - desktop");
        setIsOpen(true);
      } else if (mobile) {
        console.log("Closing sidebar - mobile");
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isAuthenticated]);

  // Close sidebar when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("Closing sidebar - logged out");
      setIsOpen(false);
    }
  }, [isAuthenticated]);

  const toggleSidebar = () => {
    if (isAuthenticated) {
      setIsOpen(!isOpen);
    }
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const openSidebar = () => {
    if (isAuthenticated && !isMobile) {
      setIsOpen(true);
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isMobile,
        toggleSidebar,
        closeSidebar,
        openSidebar,
        setIsOpen,
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
