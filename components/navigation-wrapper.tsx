"use client";

import { usePathname } from "next/navigation";
import NavMenu from "@/app/nav-menu";

export default function NavigationWrapper() {
  const pathname = usePathname();
  
  // Hide navigation on authentication pages
  const hideNavigation = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";
  
  if (hideNavigation) {
    return null;
  }
  
  return (
    <div className="no-print">
      <NavMenu />
    </div>
  );
}

