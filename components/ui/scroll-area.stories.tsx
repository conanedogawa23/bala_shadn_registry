import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './scroll-area';

const meta = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'h-[200px] w-[350px] rounded-md border',
    children: (
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Default ScrollArea</h4>
        <p className="text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, 
          nisl eget ultricies aliquam, nunc nisl ultricies nunc, vitae aliquam nisl nunc vitae nisl.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam.
        </p>
        <p className="text-sm mt-4">
          Nunc nisl ultricies nunc, vitae aliquam nisl nunc vitae nisl. Lorem ipsum dolor sit amet, 
          consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam, nunc nisl ultricies nunc.
        </p>
      </div>
    ),
  },
};

export const ShortHeight: Story = {
  args: {
    className: 'h-[100px] w-[350px] rounded-md border',
    children: (
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Short Height</h4>
        <p className="text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, 
          nisl eget ultricies aliquam, nunc nisl ultricies nunc, vitae aliquam nisl nunc vitae nisl.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam.
        </p>
      </div>
    ),
  },
};

export const TallHeight: Story = {
  args: {
    className: 'h-[400px] w-[350px] rounded-md border',
    children: (
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tall Height</h4>
        <p className="text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, 
          nisl eget ultricies aliquam, nunc nisl ultricies nunc, vitae aliquam nisl nunc vitae nisl.
        </p>
        <p className="text-sm mt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, 
          nisl eget ultricies aliquam, nunc nisl ultricies nunc, vitae aliquam nisl nunc vitae nisl.
        </p>
      </div>
    ),
  },
};

export const NarrowWidth: Story = {
  args: {
    className: 'h-[200px] w-[200px] rounded-md border',
    children: (
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Narrow Width</h4>
        <p className="text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, 
          nisl eget ultricies aliquam, nunc nisl ultricies nunc, vitae aliquam nisl nunc vitae nisl.
        </p>
      </div>
    ),
  },
};

export const WideWidth: Story = {
  args: {
    className: 'h-[200px] w-[500px] rounded-md border',
    children: (
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Wide Width</h4>
        <p className="text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, 
          nisl eget ultricies aliquam, nunc nisl ultricies nunc, vitae aliquam nisl nunc vitae nisl.
        </p>
      </div>
    ),
  },
};

export const WithListContent: Story = {
  args: {
    className: 'h-[200px] w-[350px] rounded-md border',
    children: (
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">List Content</h4>
        <ul className="space-y-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <li key={i} className="rounded bg-muted p-2 text-sm">List item {i + 1}</li>
          ))}
        </ul>
      </div>
    ),
  },
};

export const WithTableContent: Story = {
  args: {
    className: 'h-[200px] w-[350px] rounded-md border',
    children: (
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Table Content</h4>
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b">
              <th className="h-12 px-4 text-left font-medium">Name</th>
              <th className="h-12 px-4 text-left font-medium">Status</th>
              <th className="h-12 px-4 text-left font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b">
                <td className="p-4">User {i + 1}</td>
                <td className="p-4">{i % 2 === 0 ? 'Active' : 'Inactive'}</td>
                <td className="p-4">{i % 3 === 0 ? 'Admin' : 'User'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
};

export const WithCardContent: Story = {
  args: {
    className: 'h-[300px] w-[350px] rounded-md border',
    children: (
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Card Content</h4>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-3">
              <h5 className="font-medium">Card {i + 1}</h5>
              <p className="text-sm text-muted-foreground">
                This is a sample card with some content.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary"></div>
                <span className="text-xs">Sample Tag</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const WithHorizontalContent: Story = {
  args: {
    className: 'h-[200px] w-[350px] rounded-md border',
    children: (
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Horizontal Scrolling</h4>
        <div className="flex space-x-4 pb-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[150px] rounded-md border p-4 text-center"
            >
              <div className="text-sm font-medium">Item {i + 1}</div>
              <div className="text-xs text-muted-foreground">Description</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const CustomStyling: Story = {
  args: {
    className: 'h-[200px] w-[350px] rounded-md bg-secondary p-1',
    children: (
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Custom Styling</h4>
        <p className="text-sm">
          This ScrollArea has custom background styling. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Nullam euismod, nisl eget ultricies aliquam, nunc nisl ultricies nunc, vitae aliquam nisl nunc vitae nisl.
        </p>
        <p className="text-sm mt-4">
          Nunc nisl ultricies nunc, vitae aliquam nisl nunc vitae nisl. Lorem ipsum dolor sit amet, 
          consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam.
        </p>
      </div>
    ),
  },
};

