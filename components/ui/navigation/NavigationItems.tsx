"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronDown, 
  ChevronRight,
  Home, 
  Users, 
  Settings, 
  FileText, 
  HelpCircle,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/**
 * Type definition for a navigation item
 * @property {string} title - The display text for the navigation item
 * @property {string} href - The URL to navigate to
 * @property {LucideIcon} [icon] - Optional Lucide icon component
 * @property {NavItem[]} [items] - Optional child navigation items for nested navigation
 */
export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  items?: NavItem[];
}

/**
 * Default navigation items
 */
export const defaultNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
    items: [
      { title: "All Clients", href: "/clients" },
      { title: "Add New", href: "/clients/new" },
    ],
  },
  {
    title: "Orders",
    href: "/orders",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
  },
];

/**
 * Props for the NavLink component
 */
export interface NavLinkProps {
  item: NavItem;
  className?: string;
  onClick?: () => void;
}

/**
 * Navigation link component that renders a single navigation item
 */
export function NavLink({ item, className, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
    >
      {item.icon && <item.icon className="h-4 w-4" aria-hidden="true" />}
      <span>{item.title}</span>
    </Link>
  );
}

/**
 * Props for the NavGroup component
 */
export interface NavGroupProps {
  item: NavItem;
  defaultCollapsed?: boolean;
  onToggle?: (isOpen: boolean) => void;
  isOpen?: boolean;
  className?: string;
  onItemClick?: () => void;
}

/**
 * Navigation group component that renders a collapsible section with nested items
 */
export function NavGroup({ 
  item, 
  defaultCollapsed = true,
  onToggle,
  isOpen: controlledOpen,
  className,
  onItemClick
}: NavGroupProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(item.href);
  // Use controlled open state if provided, otherwise use internal state
  const [internalOpen, setInternalOpen] = React.useState(!defaultCollapsed || isActive);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    if (onToggle) {
      onToggle(newOpen);
    }
  };

  // Update collapsed state when route changes (only for uncontrolled mode)
  React.useEffect(() => {
    if (controlledOpen === undefined && isActive && !internalOpen) {
      setInternalOpen(true);
    }
  }, [isActive, internalOpen, controlledOpen]);

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange} className={className}>
      <CollapsibleTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-between px-3 py-2 text-left h-auto font-normal",
            isActive && "font-medium"
          )}
          aria-expanded={open}
        >
          <div className="flex items-center gap-2">
            {item.icon && <item.icon className="h-4 w-4" aria-hidden="true" />}
            <span>{item.title}</span>
          </div>
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="ml-6 flex flex-col gap-1 pt-1" role="list">
          {item.items?.map((child, index) => (
            <li key={index}>
              {child.items ? (
                <NavGroup 
                  item={child} 
                  defaultCollapsed={defaultCollapsed} 
                  onItemClick={onItemClick}
                />
              ) : (
                <NavLink 
                  item={child} 
                  onClick={onItemClick}
                />
              )}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Props for the NavigationMenu component
 */
export interface NavigationMenuProps {
  items: NavItem[];
  defaultCollapsed?: boolean;
  className?: string;
  onItemClick?: () => void;
}

/**
 * Navigation menu component that renders a list of navigation items
 */
export function NavigationMenu({ 
  items, 
  defaultCollapsed = false, 
  className,
  onItemClick 
}: NavigationMenuProps) {
  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Main navigation">
      <ul role="list" className="flex flex-col gap-1">
        {items.map((item, index) => (
          <li key={index}>
            {item.items ? (
              <NavGroup 
                item={item} 
                defaultCollapsed={defaultCollapsed}
                onItemClick={onItemClick}
              />
            ) : (
              <NavLink 
                item={item}
                onClick={onItemClick}
              />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

