import React from 'react';
import { z } from 'zod';
import { Meta, StoryObj } from '@storybook/react';
import { FormWrapper } from './FormWrapper';
import { FormDatePicker } from './FormDatePicker';

const dateSchema = z.object({
  birthDate: z.date({
    required_error: 'Birth date is required',
  }),
});

type FormValues = z.infer<typeof dateSchema>;

const meta: Meta<typeof FormDatePicker> = {
  title: 'Components/Form/FormDatePicker',
  component: FormDatePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    description: { control: 'text' },
    dateFormat: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof FormDatePicker>;

const Template = (args: React.ComponentProps<typeof FormDatePicker>) => (
  <FormWrapper
    schema={dateSchema}
    defaultValues={{ birthDate: new Date() }}
    onSubmit={(values) => console.log(values)}
  >
    {() => (
      <div className="max-w-sm space-y-4">
        <FormDatePicker {...args} />
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
    name: 'birthDate',
    label: 'Birth Date',
    description: 'Select your date of birth',
    dateFormat: 'MMM dd, yyyy',
    disableFutureDates: true,
  },
};