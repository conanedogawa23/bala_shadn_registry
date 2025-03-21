import * as React from "react"
import { Meta, StoryObj } from "@storybook/react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

const meta: Meta<typeof Popover> = {
  title: "UI/Popover",
  component: Popover,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-12">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Popover>

/**
 * Basic usage of the Popover component with default settings.
 */
export const Basic: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

/**
 * Demonstrates different alignment options for the popover.
 */
export const Alignment: Story = {
  render: () => (
    <div className="flex flex-col space-y-4 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align Start</Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72">
          <div className="p-2">
            <p className="font-medium">Aligned to the start</p>
            <p className="text-sm text-muted-foreground mt-1">
              This popover is aligned to the start of the trigger element.
            </p>
          </div>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align Center</Button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-72">
          <div className="p-2">
            <p className="font-medium">Aligned to the center</p>
            <p className="text-sm text-muted-foreground mt-1">
              This popover is aligned to the center of the trigger element.
            </p>
          </div>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align End</Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <div className="p-2">
            <p className="font-medium">Aligned to the end</p>
            <p className="text-sm text-muted-foreground mt-1">
              This popover is aligned to the end of the trigger element.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
}

/**
 * Demonstrates different side positions for the popover.
 */
export const Sides: Story = {
  render: () => (
    <div className="flex flex-wrap justify-center gap-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Top</Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-64">
          <p className="text-center">This popover appears on top</p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Right</Button>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-64">
          <p className="text-center">This popover appears on the right</p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" className="w-64">
          <p className="text-center">This popover appears on the bottom</p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Left</Button>
        </PopoverTrigger>
        <PopoverContent side="left" className="w-64">
          <p className="text-center">This popover appears on the left</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
}

/**
 * Demonstrates a confirmation dialog pattern using popover.
 */
// Create a proper React component that can use hooks
const ConfirmationDialogComponent = () => {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="destructive">Delete Item</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Confirm deletion</h4>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                console.log("Item deleted!")
                setOpen(false)
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const ConfirmationDialog: Story = {
  render: () => <ConfirmationDialogComponent />
}

/**
 * Demonstrates a custom styled popover.
 */
export const CustomStyling: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-blue-100 border-blue-300 hover:bg-blue-200">
          Custom Styled
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="p-2">
          <h4 className="font-medium text-blue-800 leading-none">Custom Styled Popover</h4>
          <p className="text-sm text-blue-600 mt-2">
            This popover has custom styling applied to both the trigger and content.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

/**
 * Demonstrates the popover being used as a user profile menu.
 */
export const UserProfileMenu: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            <span className="font-semibold">JD</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <span className="font-semibold">JD</span>
            </div>
            <div>
              <h4 className="font-semibold">John Doe</h4>
              <p className="text-sm text-muted-foreground">john.doe@example.com</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              View Profile
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              Settings
            </Button>
            <Button variant="outline" size="sm" className="justify-start text-red-500 hover:text-red-600">
              Sign Out
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

