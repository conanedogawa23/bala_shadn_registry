import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta = {
  title: 'UI/Inputs/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Default value',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email address...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="input-with-label" className="text-sm font-medium">Email</label>
      <Input id="input-with-label" placeholder="Email" />
    </div>
  ),
};

export const File: Story = {
  args: {
    type: 'file',
  },
};

export const ReadOnly: Story = {
  args: {
    defaultValue: 'Read-only value',
    readOnly: true,
  },
};

export const WithError: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="input-with-error" className="text-sm font-medium">Username</label>
      <Input 
        id="input-with-error" 
        placeholder="Username" 
        className="border-red-500 focus-visible:ring-red-500" 
      />
      <p className="text-sm text-red-500">This username is already taken.</p>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Input placeholder="Search..." className="pl-8" />
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round"
          strokeWidth={2} 
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
        />
      </svg>
    </div>
  ),
};

