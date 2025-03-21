import type { Meta, StoryObj } from '@storybook/react';
import { OrderSummary } from './OrderSummary';

const meta = {
  title: 'UI/Cards/OrderSummary',
  component: OrderSummary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    order: {
      description: 'Order data to display'
    },
    clickable: {
      control: 'boolean',
      description: 'Whether the order summary is clickable'
    },
    showItems: {
      control: 'boolean',
      description: 'Whether to show the order items'
    },
    showActionButton: {
      control: 'boolean',
      description: 'Whether to show the action button'
    }
  },
  args: {
    clickable: true,
    showItems: true,
    showActionButton: true,
  },
} satisfies Meta<typeof OrderSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockItems = [
  { id: '1', name: 'Product 1', quantity: 2, price: 19.99 },
  { id: '2', name: 'Product 2', quantity: 1, price: 29.99 },
  { id: '3', name: 'Product 3', quantity: 3, price: 9.99 },
];

// Base mock order data that conforms to OrderData interface
const mockOrder = {
  id: 'ORD-12345',
  orderNumber: '12345',
  clientName: 'John Doe',
  clientId: 'CLIENT-789',
  date: new Date('2023-06-15T10:30:00'),
  status: 'pending' as const,
  paymentStatus: 'unpaid' as const,
  items: mockItems,
  total: 109.94,
  notes: 'Please leave package at the door',
};

const mockOrderWithoutNotes = {
  ...mockOrder,
  notes: undefined,
};

const mockOrderWithoutItems = {
  ...mockOrder,
  items: [],
};

// Base stories for each status
export const Pending: Story = {
  args: {
    order: { ...mockOrder, status: 'pending', paymentStatus: 'unpaid' },
  },
};

export const Processing: Story = {
  args: {
    order: { ...mockOrder, status: 'processing', paymentStatus: 'paid' },
  },
};

export const Completed: Story = {
  args: {
    order: { ...mockOrder, status: 'completed', paymentStatus: 'paid' },
  },
};

export const Cancelled: Story = {
  args: {
    order: { ...mockOrder, status: 'cancelled', paymentStatus: 'refunded' },
  },
};

export const Delivered: Story = {
  args: {
    order: { ...mockOrder, status: 'delivered', paymentStatus: 'paid' },
  },
};

// Payment status variations
export const Unpaid: Story = {
  args: {
    order: { ...mockOrder, status: 'pending', paymentStatus: 'unpaid' },
  },
};

export const PartiallyPaid: Story = {
  args: {
    order: { ...mockOrder, status: 'pending', paymentStatus: 'partial' },
  },
};

export const Refunded: Story = {
  args: {
    order: { ...mockOrder, status: 'cancelled', paymentStatus: 'refunded' },
  },
};

// With/without items
export const WithoutItems: Story = {
  args: {
    order: { ...mockOrderWithoutItems, status: 'completed', paymentStatus: 'paid' },
    showItems: true,
  },
};

// With/without notes
export const WithoutNotes: Story = {
  args: {
    order: { ...mockOrderWithoutNotes, status: 'completed', paymentStatus: 'paid' },
  },
};

// Configuration variations
export const NonClickable: Story = {
  args: {
    order: { ...mockOrder, status: 'completed', paymentStatus: 'paid' },
    clickable: false,
  },
};

export const HideItems: Story = {
  args: {
    order: { ...mockOrder, status: 'completed', paymentStatus: 'paid' },
    showItems: false,
  },
};

export const HideActionButton: Story = {
  args: {
    order: { ...mockOrder, status: 'completed', paymentStatus: 'paid' },
    showActionButton: false,
  },
};

// Compact configuration (no items, no action button)
export const Compact: Story = {
  args: {
    order: { ...mockOrder, status: 'delivered', paymentStatus: 'paid' },
    showItems: false,
    showActionButton: false,
  },
};

// Complete configuration with all options
export const AllOptions: Story = {
  args: {
    order: { ...mockOrder, status: 'processing', paymentStatus: 'partial' },
    clickable: true,
    showItems: true,
    showActionButton: true,
  },
};

// Example with onViewDetails callback
export const WithCallback: Story = {
  args: {
    order: { ...mockOrder, status: 'pending', paymentStatus: 'unpaid' },
    onViewDetails: (order) => {
      console.log('View details clicked for order:', order.id);
      alert(`View details clicked for Order #${order.orderNumber}`);
    },
  },
};

