import React from 'react';
import { z } from 'zod';
import { Meta, StoryObj } from '@storybook/react';
import { FormWrapper } from './FormWrapper';
import { FormSelect } from './FormSelect';

const roleSchema = z.object({
  role: z.string().min(1, 'Role is required'),
});

type FormValues = z.infer<typeof roleSchema>;

const meta: Meta<typeof FormSelect> = {
  title: 'Components/Form/FormSelect',
  component: FormSelect,
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
type Story = StoryObj<typeof FormSelect>;

const Template = (args: React.ComponentProps<typeof FormSelect>) => (
  <FormWrapper
    schema={roleSchema}
    defaultValues={{ role: '' }}
    onSubmit={(values) => console.log(values)}
  >
    {() => (
      <div className="max-w-sm space-y-4">
        <FormSelect {...args} />
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
    name: 'role',
    label: 'User Role',
    description: 'Select user access level',
    placeholder: 'Choose a role',
    options: [
      { value: 'admin', label: 'Administrator' },
      { value: 'editor', label: 'Content Editor' },
      { value: 'viewer', label: 'Viewer' },
    ],
  },
};