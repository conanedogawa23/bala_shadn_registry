import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from 'react';
import { Button } from "../button";
import { Input } from "../input";
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "../dropdown-menu";
import { ChevronDown } from "lucide-react";

// Example data and types
type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
  createdAt: string;
};

const data: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "jane@example.com",
    createdAt: "2023-01-01T12:00:00",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "john@example.com",
    createdAt: "2023-01-02T10:30:00",
  },
  {
    id: "a9c1f87d",
    amount: 250,
    status: "success",
    email: "alex@example.com",
    createdAt: "2023-01-03T14:45:00",
  },
  {
    id: "5f2e9b13",
    amount: 75,
    status: "failed",
    email: "sam@example.com",
    createdAt: "2023-01-04T09:15:00",
  },
  {
    id: "c7d8e2f1",
    amount: 175,
    status: "success",
    email: "taylor@example.com",
    createdAt: "2023-01-05T16:20:00",
  },
  {
    id: "b3a6c9e7",
    amount: 50,
    status: "pending",
    email: "riley@example.com",
    createdAt: "2023-01-06T11:10:00",
  },
  {
    id: "9d4e1f2a",
    amount: 300,
    status: "processing",
    email: "morgan@example.com",
    createdAt: "2023-01-07T13:40:00",
  },
  {
    id: "2e5f8a3d",
    amount: 225,
    status: "success",
    email: "jordan@example.com",
    createdAt: "2023-01-08T15:30:00",
  },
  {
    id: "7b1c9d4e",
    amount: 90,
    status: "failed",
    email: "casey@example.com",
    createdAt: "2023-01-09T08:50:00",
  },
  {
    id: "e8f2a3b5",
    amount: 150,
    status: "pending",
    email: "avery@example.com",
    createdAt: "2023-01-10T14:15:00",
  },
];

// Define columns
const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return formatted;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className={`capitalize ${
          status === "success" ? "text-green-600" :
          status === "processing" ? "text-blue-600" :
          status === "failed" ? "text-red-600" :
          "text-yellow-600"
        }`}>
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString();
    },
  },
];

// Basic DataTable with Sorting Story Template
const DataTableWithSortingTemplate = () => {
  const [sorting, setSorting] = useState<SortingState>([]);

  return (
    <DataTable 
      columns={columns} 
      data={data}
      onSortingChange={setSorting}
      state={{ sorting }}
      getCoreRowModel={getCoreRowModel()}
      getSortedRowModel={getSortedRowModel()}
    />
  );
};

// DataTable with Filtering Story Template
const DataTableWithFilteringTemplate = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter emails..."
        value={(columnFilters.find(f => f.id === 'email')?.value as string) ?? ''}
        onChange={(event) =>
          setColumnFilters([
            {
              id: 'email',
              value: event.target.value,
            },
          ])
        }
        className="max-w-sm"
      />
      <DataTable 
        columns={columns} 
        data={data}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
        state={{ 
          sorting,
          columnFilters,
        }}
        getCoreRowModel={getCoreRowModel()}
        getSortedRowModel={getSortedRowModel()}
        getFilteredRowModel={getFilteredRowModel()}
      />
    </div>
  );
};

// DataTable with Pagination Story Template
const DataTableWithPaginationTemplate = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  return (
    <div className="space-y-4">
      <DataTable 
        columns={columns} 
        data={data}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
        state={{ 
          sorting,
          columnFilters,
        }}
        getCoreRowModel={getCoreRowModel()}
        getSortedRowModel={getSortedRowModel()}
        getFilteredRowModel={getFilteredRowModel()}
        getPaginationRowModel={getPaginationRowModel()}
      />
    </div>
  );
};

// DataTable with Column Visibility Story Template
const DataTableWithColumnVisibilityTemplate = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Filter emails..."
          value={(columnFilters.find(f => f.id === 'email')?.value as string) ?? ''}
          onChange={(event) =>
            setColumnFilters([
              {
                id: 'email',
                value: event.target.value,
              },
            ])
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.map((column) => {
              if (!column.accessorKey) return null;
              return (
                <DropdownMenuCheckboxItem
                  key={column.accessorKey}
                  className="capitalize"
                  checked={columnVisibility[column.accessorKey] !== false}
                  onCheckedChange={(value) =>
                    setColumnVisibility({
                      ...columnVisibility,
                      [column.accessorKey]: value,
                    })
                  }
                >
                  {column.header as string}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DataTable 
        columns={columns} 
        data={data}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
        onColumnVisibilityChange={setColumnVisibility}
        state={{ 
          sorting,
          columnFilters,
          columnVisibility,
        }}
        getCoreRowModel={getCoreRowModel()}
        getSortedRowModel={getSortedRowModel()}
        getFilteredRowModel={getFilteredRowModel()}
        getPaginationRowModel={getPaginationRowModel()}
      />
    </div>
  );
};

// Complete DataTable with all features Story Template
const CompleteDataTableTemplate = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Filter emails..."
          value={(columnFilters.find(f => f.id === 'email')?.value as string) ?? ''}
          onChange={(event) =>
            setColumnFilters([
              {
                id: 'email',
                value: event.target.value,
              },
            ])
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.map((column) => {
              if (!column.accessorKey) return null;
              return (
                <DropdownMenuCheckboxItem
                  key={column.accessorKey}
                  className="capitalize"
                  checked={columnVisibility[column.accessorKey] !== false}
                  onCheckedChange={(value) =>
                    setColumnVisibility({
                      ...columnVisibility,
                      [column.accessorKey]: value,
                    })
                  }
                >
                  {column.header as string}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DataTable 
        columns={columns} 
        data={data}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
        onColumnVisibilityChange={setColumnVisibility}
        state={{ 
          sorting,
          columnFilters,
          columnVisibility,
        }}
        getCoreRowModel={getCoreRowModel()}
        getSortedRowModel={getSortedRowModel()}
        getFilteredRowModel={getFilteredRowModel()}
        getPaginationRowModel={getPaginationRowModel()}
      />
    </div>
  );
};

// Storybook meta configuration
const meta = {
  title: 'UI/Data Display/DataTable',
  component: DataTable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define argTypes for controls
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// Define stories
export const Basic: Story = {
  args: {
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  },
};

export const WithSorting: Story = {
  render: () => <DataTableWithSortingTemplate />,
};

export const WithFiltering: Story = {
  render: () => <DataTableWithFilteringTemplate />,
};

export const WithPagination: Story = {
  render: () => <DataTableWithPaginationTemplate />,
};

export const WithColumnVisibility: Story = {
  render: () => <DataTableWithColumnVisibilityTemplate />,
};

export const CompleteExample: Story = {
  render: () => <CompleteDataTableTemplate />,
};

