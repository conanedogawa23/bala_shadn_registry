import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { addDays, format } from "date-fns"
import { Calendar } from './calendar';
import { DateRange } from 'react-day-picker';

const meta: Meta<typeof Calendar> = {
  title: 'UI/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'multiple', 'range', 'default'],
      description: 'Selection mode of the calendar',
    },
    showOutsideDays: {
      control: 'boolean',
      description: 'Show days from the previous/next month',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the calendar',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// Default Calendar with single selection mode
export const Default: Story = {
  args: {
    mode: 'single',
    className: 'rounded-md border',
  },
};

// Calendar with Range selection
// Create a proper React component that can use hooks
const RangeSelectionComponent = (args: Record<string, unknown>) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  
  return (
    <div className="space-y-4">
      <Calendar
        {...args}
        mode="range"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
      <div className="text-sm">
        <p>Selected range:</p>
        {date?.from && (
          <p>From: {format(date.from, 'PPP')}</p>
        )}
        {date?.to && (
          <p>To: {format(date.to, 'PPP')}</p>
        )}
      </div>
    </div>
  );
};

export const RangeSelection: Story = {
  args: {
    mode: 'range',
    className: 'rounded-md border',
  },
  render: (args) => <RangeSelectionComponent {...args} />,
};

// Calendar with Multiple selection
// Create a proper React component that can use hooks
const MultipleSelectionComponent = (args: Record<string, unknown>) => {
  const [dates, setDates] = useState<Date[] | undefined>([
    new Date(),
    addDays(new Date(), 2),
    addDays(new Date(), 5),
  ]);
  
  return (
    <div className="space-y-4">
      <Calendar
        {...args}
        mode="multiple"
        selected={dates}
        onSelect={setDates}
        className="rounded-md border"
      />
      <div className="text-sm">
        <p>Selected dates:</p>
        <ul>
          {dates?.map((date) => (
            <li key={date.toString()}>
              {format(date, 'PPP')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const MultipleSelection: Story = {
  args: {
    mode: 'multiple',
    className: 'rounded-md border',
  },
  render: (args) => <MultipleSelectionComponent {...args} />,
};

// Calendar with disabled dates
// Create a proper React component for DisabledDates
const DisabledDatesComponent = (args) => {
  // Disable dates that are in the past or more than 30 days in the future
  const disabledDays = [
    { before: new Date() },
    { after: addDays(new Date(), 30) },
  ];
  
  return (
    <div className="space-y-4">
      <Calendar
        {...args}
        mode="single"
        disabled={disabledDays}
        defaultMonth={new Date()}
        className="rounded-md border"
      />
      <p className="text-sm text-muted-foreground">
        Cannot select dates in the past or more than 30 days in the future.
      </p>
    </div>
  );
};

export const DisabledDates: Story = {
  args: {
    mode: 'single',
    className: 'rounded-md border',
  },
  render: (args) => <DisabledDatesComponent {...args} />,
};

// Calendar with a selected date and footer
// Create a proper React component that can use hooks
const WithSelectedDateComponent = (args) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="space-y-4">
      <Calendar
        {...args}
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
      {date && (
        <p className="text-sm">
          You selected: {format(date, 'PPP')}
        </p>
      )}
    </div>
  );
};

export const WithSelectedDate: Story = {
  args: {
    mode: 'single',
    className: 'rounded-md border',
  },
  render: (args) => <WithSelectedDateComponent {...args} />,
};

// Calendar with custom styling
export const CustomStyling: Story = {
  args: {
    mode: 'single',
    className: 'rounded-md border bg-slate-950 text-white p-4',
    classNames: {
      day_selected: "bg-blue-500 text-white",
      day_today: "bg-amber-500 text-white",
    },
  },
};

// Calendar in mini mode
export const MiniCalendar: Story = {
  args: {
    mode: 'single',
    className: 'rounded-md border w-64',
    showOutsideDays: false,
  },
};

