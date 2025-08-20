"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  NavItem, 
  NavigationMenu, 
  defaultNavItems 
} from "./NavigationItems";

/**
 * Props for the Sidebar component
 * @property {NavItem[]} items - Array of navigation items to display
 * @property {string} [className] - Optional additional CSS classes
 * @property {string} [title] - Optional title for the sidebar
 * @property {boolean} [defaultCollapsed=false] - Whether sections should be collapsed by default
 * @property {boolean} [defaultOpen=false] - Whether the mobile sidebar should be open by default
 */
export interface SidebarProps {
  items: NavItem[];
  className?: string;
  title?: string;
  defaultCollapsed?: boolean;
  defaultOpen?: boolean;
}

/**
 * A sidebar navigation component that supports nested items, collapsible sections,
 * and highlights the active route. Includes mobile responsiveness with a toggle.
 * 
 * @example
 * ```tsx
 * const navigationItems = [
 *   {
 *     title: "Dashboard",
 *     href: "/dashboard",
 *     icon: Home,
 *   },
 *   {
 *     title: "Clients",
 *     href: "/clients",
 *     icon: Users,
 *     items: [
 *       { title: "All Clients", href: "/clients" },
 *       { title: "Add New", href: "/clients/new" },
 *     ],
 *   },
 * ];
 * 
 * <Sidebar items={navigationItems} title="App Navigation" />
 * ```
 */

export function Sidebar({
  items = defaultNavItems,
  className,
  title = "Navigation",
  defaultCollapsed = false,
  defaultOpen = false,
}: SidebarProps) {
  // State for mobile navigation toggle
  const [open, setOpen] = useState(defaultOpen);

  // Close mobile navigation when route changes or ESC key is pressed
  const pathname = usePathname();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    setOpen(false);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname]);

  // Desktop sidebar layout
  const sidebarContent = (
    <>
      {title && (
        <div className="px-3 py-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      )}
      <ScrollArea className="flex-1 py-2">
        <NavigationMenu items={items} defaultCollapsed={defaultCollapsed} className="px-3" />
      </ScrollArea>
    </>
  );

  // Mobile sidebar toggle button
  const mobileToggle = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-40"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 sm:max-w-xs">
        {sidebarContent}
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      {/* Mobile navigation */}
      {mobileToggle}

      {/* Desktop navigation */}
      <aside
        className={cn(
          "fixed hidden md:flex flex-col w-64 h-screen border-r bg-background z-30",
          className
        )}
      >
        {sidebarContent}
      </aside>
      
      {/* Content spacing for desktop */}
      <div className="hidden md:block w-64" aria-hidden="true" />
    </>
  );
}

