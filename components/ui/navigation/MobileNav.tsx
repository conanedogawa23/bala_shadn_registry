"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  NavItem, 
  NavigationMenu, 
  defaultNavItems 
} from "./NavigationItems";

/**
 * Props for the MobileNav component
 * @property {NavItem[]} items - Array of navigation items to display
 * @property {string} [title] - Optional title for the navigation menu
 * @property {boolean} [defaultOpen=false] - Whether the mobile menu should be open by default
 * @property {string} [className] - Optional additional CSS classes
 */
export interface MobileNavProps {
  items?: NavItem[];
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Mobile navigation component for responsive layouts
 * Displays a hamburger menu that opens a sheet with navigation items
 */
export function MobileNav({
  items = defaultNavItems,
  title,
  defaultOpen = false,
  className,
}: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);

  // Close the mobile menu when navigating to a new page
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden", className)}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="flex items-center justify-between mb-4">
          {title && (
            <div className="text-lg font-semibold">{title}</div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
          <div className="pr-6">
            <NavigationMenu
              items={items}
              className="px-2"
              onItemClick={() => setOpen(false)}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}