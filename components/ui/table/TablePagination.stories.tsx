import type { Meta, StoryObj } from '@storybook/react';
import { TablePagination } from './TablePagination';
import { useState } from 'react';

const meta = {
  title: 'UI/Data Display/TablePagination',
  component: TablePagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: { control: 'number', description: 'Current page number (1-based)' },
    totalPages: { control: 'number', description: 'Total number of pages' },
    pageSize: { control: 'number', description: 'Number of items shown per page' },
    pageSizeOptions: { control: 'array', description: 'Available options for page size selection' },
    onPageChange: { action: 'page changed' },
    onPageSizeChange: { action: 'page size changed' },
    disabled: { control: 'boolean', description: 'Disables all pagination controls' },
    showPageSizeSelector: { control: 'boolean', description: 'Shows/hides the page size selector' },
    showPageInput: { control: 'boolean', description: 'Shows/hides the page number input' },
  },
  decorators: [
    (Story) => (
      <div className="p-6 border rounded-md" style={{ width: '800px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TablePagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default configuration with all features enabled.
 */
export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    disabled: false,
    showPageSizeSelector: true,
    showPageInput: true,
  },
};

/**
 * Example with interactive state management.
 */
export const Interactive = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [currentPage, setCurrentPage] = useState(1);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [pageSize, setPageSize] = useState(10);
    
    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-md">
          <p className="text-sm font-medium">Current State:</p>
          <p className="text-sm">Page: {currentPage}, Page Size: {pageSize}</p>
        </div>
        <TablePagination
          currentPage={currentPage}
          totalPages={10}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    );
  },
};

/**
 * Example with different page size options.
 */
export const CustomPageSizes: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    pageSize: 5,
    pageSizeOptions: [5, 15, 25, 50],
    showPageSizeSelector: true,
    showPageInput: true,
  },
};

/**
 * Example with page input field hidden.
 */
export const WithoutPageInput: Story = {
  args: {
    currentPage: 3,
    totalPages: 20,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    showPageSizeSelector: true,
    showPageInput: false,
  },
};

/**
 * Example with page size selector hidden.
 */
export const WithoutPageSizeSelector: Story = {
  args: {
    currentPage: 5,
    totalPages: 15,
    pageSize: 50,
    pageSizeOptions: [10, 20, 50, 100],
    showPageSizeSelector: false,
    showPageInput: true,
  },
};

/**
 * Example with both page input and page size selector hidden.
 */
export const MinimalControls: Story = {
  args: {
    currentPage: 7,
    totalPages: 12,
    pageSize: 10,
    showPageSizeSelector: false,
    showPageInput: false,
  },
};

/**
 * Example with disabled controls.
 */
export const Disabled: Story = {
  args: {
    currentPage: 4,
    totalPages: 10,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    disabled: true,
    showPageSizeSelector: true,
    showPageInput: true,
  },
};

/**
 * Example with many pages, demonstrating how the component handles
 * pagination controls for large datasets.
 */
export const ManyPages: Story = {
  args: {
    currentPage: 50,
    totalPages: 100,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100, 200],
    showPageSizeSelector: true,
    showPageInput: true,
  },
};

/**
 * Example showing the last page, demonstrating how the component
 * disables the next button when on the last page.
 */
export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    showPageSizeSelector: true,
    showPageInput: true,
  },
};

