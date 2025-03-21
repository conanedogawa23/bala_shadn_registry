import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { Input } from './input';
import { cn } from '@/lib/utils';

const meta: Meta<typeof Label> = {
  title: 'UI/Inputs/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'The content to display within the label',
    },
    htmlFor: {
      control: 'text',
      description: 'The ID of the form control this label is associated with',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the label',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the label is disabled',
    },
  },
  args: {
    children: 'Label Text',
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="required-input" className="after:content-['*'] after:ml-0.5 after:text-red-500">
        Required Field
      </Label>
      <Input id="required-input" />
    </div>
  ),
};


export const Customized: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="custom1" className="text-blue-500 font-bold">
          Blue Bold Label
        </Label>
        <Input id="custom1" />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="custom2" className="text-lg text-green-600 uppercase tracking-wider">
          Large Green Label
        </Label>
        <Input id="custom2" />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="custom3" className="italic text-purple-500 underline">
          Italic Purple Underlined Label
        </Label>
        <Input id="custom3" />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="disabled-input" disabled>
        Disabled Label
      </Label>
      <Input id="disabled-input" disabled />
    </div>
  ),
};

export const WithHelpText: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="help-text-input">Password</Label>
      <Input id="help-text-input" type="password" />
      <p className="text-sm text-muted-foreground">
        Your password must be at least 8 characters long.
      </p>
    </div>
  ),
};

export const FloatingLabel: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Input id="floating-label-input" className="peer h-10 pt-4" />
      <Label
        htmlFor="floating-label-input"
        className={cn(
          "absolute left-3 -top-0 text-xs transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-focus:-top-0 peer-focus:text-xs"
        )}
      >
        Floating Label
      </Label>
    </div>
  ),
};

