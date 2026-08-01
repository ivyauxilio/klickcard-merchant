"use client";

import { useSidebar } from "@/hooks/useSidebar";
import Sidebar from "./Sidebar";

export default function MobileSidebar() {
  const { isMobile } = useSidebar();

  if (!isMobile) return null;

  return <Sidebar />;
}
