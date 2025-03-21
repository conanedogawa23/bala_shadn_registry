import type { Meta, StoryObj } from '@storybook/react';
import { MobileNav } from './MobileNav';
import { NavItem } from './Sidebar'; // Import NavItem from Sidebar
import {
  Home,
  Users,
  Settings,
  Mail,
  ShoppingCart,
  Calendar,
  FileText,
  BarChart,
  HelpCircle,
  Bell,
} from 'lucide-react'; // Import icons for the navigation items

const meta: Meta<typeof MobileNav> = {
  title: 'UI/Navigation/MobileNav',
  component: MobileNav,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof MobileNav>;

// Simple navigation with no icons
export const SimpleNavigation: Story = {
  args: {
    items: [
      {
        title: 'Home',
        href: '/',
        icon: undefined,
      },
      {
        title: 'Products',
        href: '/products',
        icon: undefined,
      },
      {
        title: 'About',
        href: '/about',
        icon: undefined,
      },
      {
        title: 'Contact',
        href: '/contact',
        icon: undefined,
      },
    ],
  },
};

// Navigation with icons
export const NavigationWithIcons: Story = {
  args: {
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: Home,
      },
      {
        title: 'Customers',
        href: '/customers',
        icon: Users,
      },
      {
        title: 'Products',
        href: '/products',
        icon: ShoppingCart,
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
};

// Nested navigation structure
export const NestedNavigation: Story = {
  args: {
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: Home,
      },
      {
        title: 'Users',
        href: '/users',
        icon: Users,
        items: [
          {
            title: 'New User',
            href: '/users/new',
          },
          {
            title: 'User List',
            href: '/users/list',
          },
          {
            title: 'User Reports',
            href: '/users/reports',
          },
        ],
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        items: [
          {
            title: 'General',
            href: '/settings/general',
          },
          {
            title: 'Security',
            href: '/settings/security',
          },
          {
            title: 'Notifications',
            href: '/settings/notifications',
          },
        ],
      },
    ],
  },
};

// Complex navigation structure with mixed icons
export const ComplexNavigation: Story = {
  args: {
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: Home,
      },
      {
        title: 'Communications',
        href: '/communications',
        icon: Mail,
        items: [
          {
            title: 'Email',
            href: '/communications/email',
            icon: Mail,
          },
          {
            title: 'Notifications',
            href: '/communications/notifications',
            icon: Bell,
          },
        ],
      },
      {
        title: 'Calendar',
        href: '/calendar',
        icon: Calendar,
      },
      {
        title: 'Documents',
        href: '/documents',
        icon: FileText,
        items: [
          {
            title: 'Contracts',
            href: '/documents/contracts',
            icon: undefined,
          },
          {
            title: 'Proposals',
            href: '/documents/proposals',
            icon: undefined,
          },
          {
            title: 'Reports',
            href: '/documents/reports',
            icon: BarChart,
          },
        ],
      },
      {
        title: 'Help & Support',
        href: '/help',
        icon: HelpCircle,
      },
    ],
  },
};

