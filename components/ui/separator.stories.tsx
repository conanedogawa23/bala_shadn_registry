import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "The orientation of the separator",
      defaultValue: "horizontal",
    },
    decorative: {
      control: "boolean",
      description: "Whether the separator is purely decorative",
      defaultValue: true,
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default separator is horizontal.
 */
export const Default: Story = {
  args: {},
  render: (args) => (
    <div className="w-[300px]">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Default Separator</h4>
        <p className="text-sm text-muted-foreground">
          A horizontal line that separates content
        </p>
      </div>
      <Separator {...args} className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Content below</div>
      </div>
    </div>
  ),
};

/**
 * Vertical separators are useful for separating inline elements.
 */
export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <div className="flex h-[100px] items-center space-x-4">
      <div>Content</div>
      <Separator {...args} className="h-[80px]" />
      <div>Content</div>
    </div>
  ),
};

/**
 * Separators with custom colors can be created by applying a background color class.
 */
export const CustomColor: Story = {
  args: {},
  render: (args) => (
    <div className="w-[300px]">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Custom Color</h4>
      </div>
      <Separator {...args} className="my-4 bg-primary" />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Success</h4>
      </div>
      <Separator {...args} className="my-4 bg-green-500" />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Error</h4>
      </div>
      <Separator {...args} className="my-4 bg-red-500" />
    </div>
  ),
};

/**
 * Example showing a separator within context, such as a menu or list.
 */
export const InContext: Story = {
  render: () => (
    <div className="w-[300px] rounded-md border p-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Menu Example</h4>
        <p className="text-sm text-muted-foreground">
          Using a separator in a menu context
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-col space-y-3 text-sm">
        <div className="cursor-pointer">Profile</div>
        <div className="cursor-pointer">Settings</div>
        <Separator className="my-1" />
        <div className="cursor-pointer text-red-500">Logout</div>
      </div>
    </div>
  ),
};

/**
 * A thicker separator can be created by adjusting the height.
 */
export const Thickness: Story = {
  render: () => (
    <div className="w-[300px]">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Default (1px)</h4>
      </div>
      <Separator className="my-4" />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Medium (2px)</h4>
      </div>
      <Separator className="my-4 h-[2px]" />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Thick (4px)</h4>
      </div>
      <Separator className="my-4 h-[4px]" />
    </div>
  ),
};

/**
 * Separators can be styled with dashed or dotted lines.
 */
export const Styles: Story = {
  render: () => (
    <div className="w-[300px]">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Solid (Default)</h4>
      </div>
      <Separator className="my-4" />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Dashed</h4>
      </div>
      <div className="my-4 h-[1px] w-full bg-border [background:linear-gradient(to_right,black_50%,transparent_50%)_repeat-x_left] [background-size:16px_1px] dark:[background:linear-gradient(to_right,white_50%,transparent_50%)_repeat-x_left] dark:[background-size:16px_1px]" />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Dotted</h4>
      </div>
      <div className="my-4 h-[1px] w-full bg-border [background:linear-gradient(to_right,black_25%,transparent_25%)_repeat-x_left] [background-size:4px_1px] dark:[background:linear-gradient(to_right,white_25%,transparent_25%)_repeat-x_left] dark:[background-size:4px_1px]" />
    </div>
  ),
};

