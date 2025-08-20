import { Meta, StoryObj } from "@storybook/react";
import { 
  Home, 
  Users, 
  ShoppingCart, 
  Settings, 
  HelpCircle, 
  FileText, 
  BarChart,
  CreditCard
} from "lucide-react";

import { Sidebar } from "./Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Navigation/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// Default sidebar with nested navigation
export const Default: Story = {
  args: {
    title: "My Application",
    items: [
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
          { title: "Import", href: "/clients/import" },
        ],
      },
      {
        title: "Orders",
        href: "/orders",
        icon: ShoppingCart,
        items: [
          { title: "All Orders", href: "/orders" },
          { title: "Create Order", href: "/orders/new" },
          { title: "Pending", href: "/orders/pending" },
          { title: "Completed", href: "/orders/completed" },
        ],
      },
      {
        title: "Reports",
        href: "/reports",
        icon: BarChart,
        items: [
          { title: "Sales", href: "/reports/sales" },
          { title: "Customers", href: "/reports/customers" },
          { title: "Inventory", href: "/reports/inventory" },
        ],
      },
      {
        title: "Invoices",
        href: "/invoices",
        icon: FileText,
      },
      {
        title: "Payments",
        href: "/payments",
        icon: CreditCard,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
      {
        title: "Help & Support",
        href: "/help",
        icon: HelpCircle,
      },
    ],
  },
};

// Sidebar with sections initially collapsed
export const InitiallyCollapsed: Story = {
  args: {
    ...Default.args,
    defaultCollapsed: true,
  },
};

// Sidebar with minimal options for simple navigation
export const Minimal: Story = {
  args: {
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
      {
        title: "Clients",
        href: "/clients",
        icon: Users,
      },
      {
        title: "Orders",
        href: "/orders",
        icon: ShoppingCart,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
};

// Sidebar with deeply nested navigation items
export const DeepNesting: Story = {
  args: {
    title: "Advanced Navigation",
    items: [
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
          { 
            title: "Client Categories", 
            href: "/clients/categories",
            items: [
              { title: "Corporate", href: "/clients/categories/corporate" },
              { title: "Individual", href: "/clients/categories/individual" },
              { 
                title: "Special Accounts", 
                href: "/clients/categories/special",
                items: [
                  { title: "VIP", href: "/clients/categories/special/vip" },
                  { title: "Partner", href: "/clients/categories/special/partner" },
                ],
              },
            ],
          },
          { title: "Add New", href: "/clients/new" },
        ],
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
};