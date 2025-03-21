import type { Meta, StoryObj } from '@storybook/react';
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter, 
  SheetClose 
} from './sheet';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

/**
 * The Sheet component is a dialog that slides in from the edge of the screen.
 * It's commonly used for side navigation on mobile, filter panels, or creating and editing content.
 */
const meta: Meta<typeof Sheet> = {
  title: 'UI/Overlay/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-8">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    // Since Sheet is a compound component, we don't have direct props to control at this level
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

/**
 * Default sheet that slides in from the right side of the screen.
 */
export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="John Doe" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@johndoe" className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

/**
 * Sheet positioned at the left side of the screen.
 */
export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Left Sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Quick access to important sections.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 mt-4">
          {['Dashboard', 'Account', 'Settings', 'Billing', 'Help & Support'].map((item) => (
            <Button key={item} variant="ghost" className="justify-start">
              {item}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  ),
};

/**
 * Sheet positioned at the top of the screen.
 */
export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Top Sheet</Button>
      </SheetTrigger>
      <SheetContent side="top" className="h-1/3">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Recent notifications and updates.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          <div className="rounded-md border p-3">
            <p className="font-medium">New message from Team</p>
            <p className="text-sm text-muted-foreground">10m ago</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="font-medium">Your subscription expires soon</p>
            <p className="text-sm text-muted-foreground">2h ago</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

/**
 * Sheet positioned at the bottom of the screen.
 */
export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Bottom Sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-1/3">
        <SheetHeader>
          <SheetTitle>Quick Actions</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {['Share', 'Export', 'Print', 'Delete', 'Duplicate', 'Archive'].map((action) => (
            <Button key={action} variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              {action}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  ),
};

/**
 * Example of a settings panel using the Sheet component.
 */
export const SettingsPanel: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Settings</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Application Settings</SheetTitle>
          <SheetDescription>
            Configure your application preferences.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Theme</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Light</Button>
              <Button variant="outline" size="sm">Dark</Button>
              <Button variant="outline" size="sm">System</Button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Notifications</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">Important</Button>
              <Button variant="outline" size="sm">None</Button>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fontSize" className="text-right">
              Font Size
            </Label>
            <Input id="fontSize" value="16px" className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

/**
 * Sheet with a larger width, useful for more complex forms or content.
 */
export const LargeSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Large Sheet</Button>
      </SheetTrigger>
      <SheetContent className="w-[95%] sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Create New Project</SheetTitle>
          <SheetDescription>
            Enter project details to get started.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectName" className="text-right">
              Project Name
            </Label>
            <Input id="projectName" placeholder="My New Project" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input id="description" placeholder="Brief project description" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template" className="text-right">
              Template
            </Label>
            <Input id="template" placeholder="Blank" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="privacy" className="text-right">
              Privacy
            </Label>
            <Input id="privacy" placeholder="Public" className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button type="submit">Create Project</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

/**
 * Sheet that displays a shopping cart, a common use case.
 */
export const ShoppingCart: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Your Cart (3)</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            You have 3 items in your cart.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          {[
            { name: "Product 1", price: "$19.99", quantity: 1 },
            { name: "Product 2", price: "$29.99", quantity: 1 },
            { name: "Product 3", price: "$39.99", quantity: 1 },
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">{item.price}</p>
            </div>
          ))}
          <div className="flex justify-between items-center mt-4 pt-2">
            <p className="font-medium">Total</p>
            <p className="font-bold">$89.97</p>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Continue Shopping</Button>
          </SheetClose>
          <Button>Checkout</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

