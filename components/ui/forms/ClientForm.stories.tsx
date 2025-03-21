import type { Meta, StoryObj } from '@storybook/react';
import { ClientForm, ClientFormValues } from './ClientForm';

// Example of how to handle form submission in stories
const handleSubmit = (data: ClientFormValues) => {
  console.log('Form submitted:', data);
  alert(JSON.stringify(data, null, 2));
};

/**
 * A form component for creating or editing client information.
 * 
 * This form supports:
 * - Creating new clients (empty form)
 * - Editing existing clients (prefilled form)
 * - Form validation
 * - Loading states
 * - Tag management
 */
const meta: Meta<typeof ClientForm> = {
  title: 'UI/Forms/ClientForm',
  component: ClientForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValues: {
      description: 'Initial values for the form fields',
      control: 'object',
    },
    onSubmit: {
      description: 'Function called when the form is submitted',
      action: 'submitted',
    },
    isLoading: {
      description: 'Whether the form is in a loading state',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ClientForm>;

/**
 * Empty form for creating a new client.
 */
export const CreateNew: Story = {
  args: {
    onSubmit: handleSubmit,
    isLoading: false,
  },
};

/**
 * Form prefilled with client data for editing an existing client.
 */
export const EditExisting: Story = {
  args: {
    defaultValues: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main Street\nApt 4B\nNew York, NY 10001',
      status: 'active',
      tags: ['VIP', 'Retail'],
      notes: 'Prefers email communication. Has been a client since 2020.',
    },
    onSubmit: handleSubmit,
    isLoading: false,
  },
};

/**
 * Form in loading state, typically shown when submitting data to the server.
 */
export const Loading: Story = {
  args: {
    defaultValues: {
      name: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      phone: '(555) 987-6543',
      status: 'active',
    },
    onSubmit: handleSubmit,
    isLoading: true,
  },
};

/**
 * Form for a client with inactive status.
 */
export const InactiveClient: Story = {
  args: {
    defaultValues: {
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      phone: '555-321-9876',
      address: '456 Oak Avenue, Chicago, IL 60007',
      status: 'inactive',
      tags: ['Former', 'Enterprise'],
      notes: 'Account inactive since January 2023.',
    },
    onSubmit: handleSubmit,
    isLoading: false,
  },
};

/**
 * Form for a client with pending status.
 */
export const PendingClient: Story = {
  args: {
    defaultValues: {
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      phone: '(555) 789-0123',
      status: 'pending',
      tags: ['New', 'Referred'],
      notes: 'Awaiting account approval.',
    },
    onSubmit: handleSubmit,
    isLoading: false,
  },
};

/**
 * Form with multiple tags to showcase the tag management feature.
 */
export const WithManyTags: Story = {
  args: {
    defaultValues: {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '(555) 234-5678',
      status: 'active',
      tags: ['Premium', 'Tech', 'International', 'Monthly', 'Marketing', 'Early Adopter', 'Beta Tester'],
      notes: 'Client has multiple service subscriptions.',
    },
    onSubmit: handleSubmit,
    isLoading: false,
  },
};

/**
 * Form for a minimal client record with just the required fields.
 */
export const MinimalClient: Story = {
  args: {
    defaultValues: {
      name: 'Sam Lee',
      email: 'sam.lee@example.com',
      phone: '555-555-5555',
      status: 'active',
    },
    onSubmit: handleSubmit,
    isLoading: false,
  },
};

/**
 * Form for a comprehensive client record with all fields filled.
 */
export const ComprehensiveClient: Story = {
  args: {
    defaultValues: {
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      phone: '(555) 456-7890',
      address: '789 Pine Street\nSuite 300\nSan Francisco, CA 94101',
      status: 'active',
      tags: ['Enterprise', 'Premium', 'West Coast', 'Tech'],
      notes: 'Key enterprise client with multiple departments using our services. Regular check-ins scheduled quarterly. Prefers demos before new feature adoption. Main technical contact is Michael Chen (michael.chen@example.com).',
    },
    onSubmit: handleSubmit,
    isLoading: false,
  },
};

