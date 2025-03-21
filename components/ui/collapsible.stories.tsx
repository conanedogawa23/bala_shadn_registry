import * as React from "react"
import { Meta, StoryObj } from "@storybook/react"
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "./collapsible"
import { Button } from "./button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { ChevronDown, ChevronUp, Plus, Minus, ArrowDownIcon } from "lucide-react"

const meta: Meta<typeof Collapsible> = {
  title: "UI/Disclosure/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Whether the collapsible is open",
    },
    defaultOpen: {
      control: "boolean",
      description: "Whether the collapsible is open by default",
    },
    onOpenChange: {
      action: "openChange",
      description: "Event handler for when the open state changes",
    },
    disabled: {
      control: "boolean",
      description: "Whether the collapsible is disabled",
    },
  },
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj<typeof Collapsible>

/**
 * A basic collapsible component with a simple trigger and content.
 */
export const Basic: Story = {
  render: (args) => (
    <Collapsible
      className="w-[350px] space-y-2"
      {...args}
    >
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">
          What is a Collapsible component?
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          The Collapsible component allows you to create expandable/collapsible
          sections of content, useful for hiding complex information that can be
          progressively disclosed when needed.
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
}

/**
 * A FAQ-style collapsible component with multiple questions and answers.
 */
export const FAQ: Story = {
  render: (args) => (
    <div className="space-y-4 w-[400px]">
      <Collapsible className="w-full border rounded-md p-2" {...args}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">How do I reset my password?</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pt-2">
          <p className="text-sm text-muted-foreground">
            Go to the login page and click on "Forgot password". Follow the 
            instructions sent to your email to reset your password.
          </p>
        </CollapsibleContent>
      </Collapsible>
      
      <Collapsible className="w-full border rounded-md p-2" {...args}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">How do I upgrade my account?</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pt-2">
          <p className="text-sm text-muted-foreground">
            Visit your account settings and select "Upgrade Plan". Choose your preferred
            plan and follow the payment instructions.
          </p>
        </CollapsibleContent>
      </Collapsible>
      
      <Collapsible className="w-full border rounded-md p-2" {...args}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">How do I cancel my subscription?</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pt-2">
          <p className="text-sm text-muted-foreground">
            Go to your account settings, select "Billing", and click on "Cancel Subscription".
            Follow the prompts to confirm cancellation.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
}

/**
 * A collapsible component with a custom animation using CSS transitions.
 */
export const WithAnimation: Story = {
  render: (args) => (
    <Collapsible className="w-[350px]" {...args}>
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">Animated Collapsible</h4>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            {args.open ? (
              <span className="flex items-center">
                Less <Minus className="ml-2 h-4 w-4" />
              </span>
            ) : (
              <span className="flex items-center">
                More <Plus className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent 
        className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div className="rounded-md border p-4 mt-2">
          <p className="text-sm">
            This collapsible section has custom animation effects applied using
            CSS transitions. The content slides down when opening and slides up
            when closing with a duration of 300ms and ease-in-out timing.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
  args: {
    open: false,
  },
}

/**
 * A collapsible component containing a complex UI with cards.
 */
export const WithCards: Story = {
  render: (args) => (
    <Collapsible className="w-[400px]" {...args}>
      <div className="flex items-center justify-between space-x-4 px-2 py-3">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">New</Badge>
          <h4 className="text-sm font-semibold">Project Details</h4>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Marketing Campaign</CardTitle>
            <CardDescription>Launch timeline and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm">Status:</span>
                <Badge className="col-span-2" variant="secondary">In Progress</Badge>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm">Deadline:</span>
                <span className="col-span-2 text-sm">October 20, 2023</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm">Budget:</span>
                <span className="col-span-2 text-sm">$12,500</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="sm" className="w-full">View Details</Button>
          </CardFooter>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  ),
}

/**
 * A nested collapsible component demonstrating hierarchical collapsible sections.
 */
export const NestedCollapsible: Story = {
  render: (args) => (
    <Collapsible className="w-[350px] rounded-md border p-2" {...args}>
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-medium">Products</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="p-2">
        <ul className="space-y-2">
          <li>
            <Collapsible className="w-full">
              <div className="flex items-center justify-between px-2">
                <span className="text-sm">Electronics</span>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="ml-4 border-l pl-2 mt-1">
                <ul className="space-y-1">
                  <li className="text-sm">Computers</li>
                  <li className="text-sm">Smartphones</li>
                  <li className="text-sm">TVs</li>
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </li>
          <li>
            <Collapsible className="w-full">
              <div className="flex items-center justify-between px-2">
                <span className="text-sm">Clothing</span>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="ml-4 border-l pl-2 mt-1">
                <ul className="space-y-1">
                  <li className="text-sm">Men's</li>
                  <li className="text-sm">Women's</li>
                  <li className="text-sm">Kids</li>
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  ),
}

