import { Meta, StoryObj } from "@storybook/react"
import { Button } from "./button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

const meta: Meta<typeof Tooltip> = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="flex items-center justify-center p-8">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover over me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const TopPosition: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Top tooltip</Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>This tooltip appears on top</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const RightPosition: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Right tooltip</Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>This tooltip appears on the right</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const BottomPosition: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Bottom tooltip</Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>This tooltip appears at the bottom</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const LeftPosition: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Left tooltip</Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>This tooltip appears on the left</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const WithHtml: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">With HTML content</Button>
      </TooltipTrigger>
      <TooltipContent>
        <div>
          <h4 className="font-medium">Tooltip title</h4>
          <p className="text-xs text-muted-foreground">
            This tooltip has a title and description
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
}

export const CustomDelay: Story = {
  render: () => (
    <Tooltip delayDuration={700}>
      <TooltipTrigger asChild>
        <Button variant="outline">Delayed tooltip</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This tooltip has a custom delay of 700ms</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const CustomWidth: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Wide tooltip</Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[250px]">
        <p>
          This tooltip has a custom width and contains a longer description
          which wraps onto multiple lines for demonstration purposes.
        </p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Tooltip with icon</Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <p>Important information</p>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
}

