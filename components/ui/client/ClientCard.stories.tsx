import type { Meta, StoryObj } from '@storybook/react';
import { ClientCard } from './ClientCard';
import { User } from 'lucide-react';

const meta: Meta<typeof ClientCard> = {
  title: 'UI/Client/ClientCard',
  component: ClientCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    client: {
      description: 'Client data object',
    },
    onEdit: { action: 'edited' },
    onDelete: { action: 'deleted' },
    onToggleFavorite: { action: 'toggled favorite' },
    className: { control: 'text' },
    isLoading: { control: 'boolean' },
    actionsDisabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ClientCard>;

// Base client data
const baseClient = {
  id: '1',
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  status: 'active' as const,
  isFavorite: false,
};

export const Default: Story = {
  args: {
    client: baseClient,
  },
};

export const WithAvatar: Story = {
  args: {
    client: {
      ...baseClient,
      avatarUrl: 'https://i.pravatar.cc/300?img=1',
    },
  },
};

export const Favorite: Story = {
  args: {
    client: {
      ...baseClient,
      isFavorite: true,
    },
  },
};

export const WithAdditionalFields: Story = {
  args: {
    client: {
      ...baseClient,
      phone: '+1 (555) 123-4567',
      address: '123 Main St, Anytown, USA',
      notes: 'Prefers email communication over phone calls.',
    },
  },
};

export const ActiveStatus: Story = {
  args: {
    client: {
      ...baseClient,
      status: 'active',
    },
  },
};

export const InactiveStatus: Story = {
  args: {
    client: {
      ...baseClient,
      status: 'inactive',
    },
  },
};

export const PendingStatus: Story = {
  args: {
    client: {
      ...baseClient,
      status: 'pending',
    },
  },
};

export const LoadingState: Story = {
  args: {
    client: baseClient,
    isLoading: true,
  },
};

export const ActionsDisabledState: Story = {
  args: {
    client: baseClient,
    actionsDisabled: true,
  },
};

export const CompleteExample: Story = {
  args: {
    client: {
      id: '1',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      avatarUrl: 'https://i.pravatar.cc/300?img=1',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, Anytown, USA',
      notes: 'Prefers email communication over phone calls.',
      status: 'active',
      isFavorite: true,
    },
  },
};

// This story was removed because ClientCard doesn't accept an avatarFallback prop.
// The AvatarFallback component inside ClientCard already handles this with initials.

export const WithCustomClassName: Story = {
  args: {
    client: baseClient,
    className: 'border-purple-500 shadow-lg',
  },
};

