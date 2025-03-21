import type { Meta, StoryObj } from '@storybook/react';
import { StatsCard } from './StatsCard';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon,
  DollarSignIcon, 
  UsersIcon, 
  ShoppingCartIcon, 
  ActivityIcon, 
  EyeIcon
} from 'lucide-react';

const meta: Meta<typeof StatsCard> = {
  title: 'UI/Cards/StatsCard',
  component: StatsCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title of the stats card',
    },
    value: {
      control: 'text',
      description: 'The main value to display',
    },
    description: {
      control: 'text',
      description: 'Optional description text, often showing the change',
    },
    trend: {
      control: { type: 'select' },
      options: ['up', 'down', 'neutral'],
      description: 'Direction of the trend (affects color and icon)',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'info', 'success', 'warning', 'danger'],
      description: 'Visual style variant of the card',
    },
    icon: {
      description: 'Optional icon component to display',
    },
    period: {
      control: 'text',
      description: 'Optional time period text',
    },
    footer: {
      control: 'text',
      description: 'Optional footer content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatsCard>;

// Base story - default variant
export const Default: Story = {
  args: {
    title: 'Total Revenue',
    value: '$45,231.89',
    description: '+20.1% from last month',
    trend: 'up',
  },
};

// Primary variant
export const Primary: Story = {
  args: {
    ...Default.args,
    variant: 'primary',
    icon: <DollarSignIcon className="h-8 w-8" />,
  },
};

// Secondary variant
export const Secondary: Story = {
  args: {
    title: 'Active Users',
    value: '2,420',
    description: '+12.3% from last week',
    trend: 'up',
    variant: 'secondary',
    icon: <UsersIcon className="h-8 w-8" />,
  },
};

// Info variant
export const Info: Story = {
  args: {
    title: 'Page Views',
    value: '1.2M',
    description: '+5.7% from last month',
    trend: 'up',
    variant: 'info',
    icon: <EyeIcon className="h-8 w-8" />,
  },
};

// Success variant
export const Success: Story = {
  args: {
    title: 'Conversion Rate',
    value: '3.2%',
    description: '+2.4% from last month',
    trend: 'up',
    variant: 'success',
    icon: <ActivityIcon className="h-8 w-8" />,
  },
};

// Warning variant
export const Warning: Story = {
  args: {
    title: 'Bounce Rate',
    value: '42.5%',
    description: '+12.3% from last month',
    trend: 'up',
    variant: 'warning',
  },
};

// Danger variant
export const Danger: Story = {
  args: {
    title: 'Cart Abandonment',
    value: '68.3%',
    description: '+4.5% from last month',
    trend: 'up',
    variant: 'danger',
    icon: <ShoppingCartIcon className="h-8 w-8" />,
  },
};

// Different trend directions
export const DownTrend: Story = {
  args: {
    title: 'Sales',
    value: '$12,543.21',
    description: '-8.4% from last month',
    trend: 'down',
    variant: 'danger',
  },
};

export const NeutralTrend: Story = {
  args: {
    title: 'Average Order Value',
    value: '$45.50',
    description: 'No change from last month',
    trend: 'neutral',
    variant: 'secondary',
  },
};

// With period
export const WithPeriod: Story = {
  args: {
    title: 'New Customers',
    value: '356',
    description: '+18.3% from previous period',
    trend: 'up',
    variant: 'success',
    period: 'Last 30 days',
  },
};

// With footer
export const WithFooter: Story = {
  args: {
    title: 'Total Sales',
    value: '$89,021.35',
    description: '+14.2% from last quarter',
    trend: 'up',
    variant: 'primary',
    footer: 'Updated just now',
  },
};

// Comprehensive example
export const Comprehensive: Story = {
  args: {
    title: 'Monthly Revenue',
    value: '$124,750.32',
    description: '+22.4% from last quarter',
    trend: 'up',
    variant: 'primary',
    icon: <DollarSignIcon className="h-8 w-8" />,
    period: 'Jan 1 - Jan 31, 2023',
    footer: 'Last updated: Today at 09:45 AM',
  },
};

// Without description
export const WithoutDescription: Story = {
  args: {
    title: 'Total Users',
    value: '42,512',
    variant: 'info',
    icon: <UsersIcon className="h-8 w-8" />,
  },
};

// Without icon
export const WithoutIcon: Story = {
  args: {
    title: 'Conversion Rate',
    value: '2.6%',
    description: '+0.4% from last week',
    trend: 'up',
    variant: 'success',
  },
};

// Minimal
export const Minimal: Story = {
  args: {
    title: 'Page Views',
    value: '3.8M',
  },
};

// Different trend indicators in a grid layout
export const TrendIndicators: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
      <StatsCard 
        title="Revenue Growth" 
        value="+20.1%" 
        trend="up" 
        variant="success"
        icon={<ArrowUpIcon className="h-6 w-6" />}
      />
      <StatsCard 
        title="Cost Reduction" 
        value="-15.3%" 
        trend="down" 
        variant="success"
        icon={<ArrowDownIcon className="h-6 w-6" />}
      />
      <StatsCard 
        title="Customer Satisfaction" 
        value="98%" 
        trend="neutral" 
        variant="info"
        icon={<MinusIcon className="h-6 w-6" />}
      />
    </div>
  ),
};

