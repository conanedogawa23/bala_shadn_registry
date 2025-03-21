import React from 'react';
import { z } from 'zod';
import { Meta, StoryObj } from '@storybook/react';
import { FormWrapper } from './FormWrapper';
import { FormInput } from './FormInput';

const validationSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
});

type FormValues = z.infer<typeof validationSchema>;

const meta: Meta<typeof FormInput> = {
  title: 'Components/Form/FormInput',
  component: FormInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    description: { control: 'text' },
    placeholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof FormInput>;

const Template = (args: React.ComponentProps<typeof FormInput>) => (
  <FormWrapper
    schema={validationSchema}
    defaultValues={{ username: '', email: '' }}
    onSubmit={(values) => console.log(values)}
  >
    {() => (
      <div className="max-w-sm space-y-4">
        <FormInput {...args} />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
          Submit
        </button>
      </div>
    )}
  </FormWrapper>
);

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    name: 'username',
    label: 'Username',
    description: 'Enter your display name',
    placeholder: 'john_doe',
  },
};

export const Email: Story = {
  render: (args) => <Template {...args} />,
  args: {
    name: 'email',
    label: 'Email Address',
    description: 'Enter your email address',
    placeholder: 'john@example.com',
    type: 'email',
  },
};