import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the textarea',
    },
    className: {
      control: 'text',
      description: 'Additional classes to apply to the textarea',
    },
    value: {
      control: 'text',
      description: 'The value of the textarea',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default textarea
export const Default: Story = {
  args: {
    placeholder: 'Type your message here.',
  },
};

// Disabled textarea
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled textarea',
  },
};

// Textarea with initial value
export const WithValue: Story = {
  args: {
    value: 'This is a pre-filled textarea with some initial content.',
  },
  render: (args) => {
    return <Textarea {...args} defaultValue={args.value} />;
  },
};

// Textarea with different sizes
export const Small: Story = {
  args: {
    placeholder: 'Small textarea',
    className: 'min-h-[40px] text-xs',
  },
};

export const Large: Story = {
  args: {
    placeholder: 'Large textarea',
    className: 'min-h-[120px] text-lg',
  },
};

// Textarea with validation states
export const Error: Story = {
  args: {
    placeholder: 'Error state',
    className: 'border-red-500 focus-visible:ring-red-500',
  },
};

export const Success: Story = {
  args: {
    placeholder: 'Success state',
    className: 'border-green-500 focus-visible:ring-green-500',
  },
};

// Textarea within a form context
export const WithLabel: Story = {
  render: () => {
    return (
      <div className="grid w-full gap-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          Your message
        </label>
        <Textarea id="message" placeholder="Type your message here." />
        <p className="text-xs text-gray-500">
          Your message will be sent to our team.
        </p>
      </div>
    );
  },
};

// Resizable textarea
export const Resizable: Story = {
  args: {
    placeholder: 'This textarea is resizable',
    className: 'resize-y',
  },
};

// Read-only textarea
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 'This is a read-only textarea. You cannot edit this content.',
  },
};

