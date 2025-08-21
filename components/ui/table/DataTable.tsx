import * as React from "react";
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
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/Table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * Props for the DataTable component
 * @template TData The type of data in the table
 * @template TValue The type of values in the table cells
 */
interface DataTableProps<TData, TValue> {
  /**
   * The columns configuration for the table
   */
  columns: ColumnDef<TData, TValue>[];
  
  /**
   * The data to be displayed in the table
   */
  data: TData[];
  
  /**
   * Optional toolbar component to render above the table
   */
  toolbar?: React.ReactNode;
  
  /**
   * Whether to show the filter input in the default toolbar
   * @default true
   */
  showFilter?: boolean;
  
  /**
   * Whether to show column visibility toggle
   * @default true
   */
  showColumnToggle?: boolean;
  
  /**
   * The placeholder text for the filter input
   * @default "Filter..."
   */
  filterPlaceholder?: string;
  
  /**
   * The key to use for global filtering
   */
  globalFilterKey?: keyof TData;
  
  /**
   * The default number of rows per page
   * @default 10
   */
  defaultPageSize?: number;
  
  /**
   * Whether to show the built-in pagination controls
   * @default true
   */
  showPagination?: boolean;
  
  /**
   * CSS class name for the table container
   */
  className?: string;
}

/**
 * A fully-featured data table component with sorting, filtering, and pagination
 * 
 * @template TData The type of data being displayed in the table
 * @template TValue The type of values in the table cells
 * 
 * @example
 * ```tsx
 * type User = {
 *   id: string;
 *   name: string;
 *   email: string;
 *   role: string;
 * };
 * 
 * const columns: ColumnDef<User>[] = [
 *   {
 *     accessorKey: "name",
 *     header: "Name",
 *   },
 *   {
 *     accessorKey: "email",
 *     header: "Email",
 *   },
 *   // Add more columns as needed
 * ];
 * 
 * <DataTable columns={columns} data={users} />
 * ```
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  showFilter = true,
  showColumnToggle = true,
  filterPlaceholder = "Filter...",
  globalFilterKey,
  defaultPageSize = 10,
  showPagination = true,
  className,
}: DataTableProps<TData, TValue>) {
  // State for table features
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState({});

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(globalFilterKey
        ? { globalFilter: globalFilter }
        : {}),
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
      },
    },
  });

  // Custom filter function for global filtering if a key is provided
  React.useEffect(() => {
    if (globalFilterKey && globalFilter) {
      table.getColumn(globalFilterKey as string)?.setFilterValue(globalFilter);
    }
  }, [globalFilter, globalFilterKey, table]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      {(toolbar || showFilter || showColumnToggle) && (
        <div className="flex items-center justify-between gap-2">
          {toolbar ? (
            toolbar
          ) : (
            <div className="flex items-center gap-2">
              {showFilter && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={filterPlaceholder}
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="h-9 w-[250px]"
                  />
                  {globalFilter && (
                    <Button
                      variant="ghost"
                      onClick={() => setGlobalFilter("")}
                      className="h-9 px-2 lg:px-3"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <Badge variant="secondary" className="rounded-md px-2 font-normal">
                  {table.getFilteredSelectedRowModel().rows.length} selected
                </Badge>
              )}
            </div>
          )}

          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : header.column.getCanSort() ? (
                            <Button
                              variant="ghost"
                              onClick={() => header.column.toggleSorting()}
                              className={cn(
                                "flex items-center gap-1 p-0 font-medium",
                                header.column.getIsSorted() && "text-primary"
                              )}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-50" />
                              )}
                            </Button>
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={row.getIsSelected() ? "bg-muted/50" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <strong>
              {table.getFilteredRowModel().rows.length > 0
                ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
                : 0}
              -
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </strong>{" "}
            of <strong>{table.getFilteredRowModel().rows.length}</strong> results
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="h-8 w-16 rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronDown className="h-4 w-4 rotate-90" />
              </Button>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Go to next page</span>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

