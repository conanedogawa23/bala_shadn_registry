import type { Meta, StoryObj } from '@storybook/react';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './Table';
import { Button } from '../button';
import { useState } from 'react';

const meta: Meta<typeof Table> = {
  title: 'UI/Data Display/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS class names',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

// Basic Table Example
export const BasicTable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Developer</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell>jane@example.com</TableCell>
          <TableCell>Designer</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Robert Johnson</TableCell>
          <TableCell>robert@example.com</TableCell>
          <TableCell>Product Manager</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// Table with Caption
export const TableWithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of team members and their roles.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Developer</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell>jane@example.com</TableCell>
          <TableCell>Designer</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Robert Johnson</TableCell>
          <TableCell>robert@example.com</TableCell>
          <TableCell>Product Manager</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// Sortable Table
export const SortableTable: Story = {
  render: function Render() {
    const [data, setData] = useState([
      { name: "John Doe", email: "john@example.com", role: "Developer" },
      { name: "Jane Smith", email: "jane@example.com", role: "Designer" },
      { name: "Robert Johnson", email: "robert@example.com", role: "Product Manager" },
      { name: "Emily Adams", email: "emily@example.com", role: "QA Engineer" },
    ]);
    
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    
    const handleSort = (column: string) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
      
      const sortedData = [...data].sort((a, b) => {
        const valueA = a[column as keyof typeof a];
        const valueB = b[column as keyof typeof b];
        
        if (sortDirection === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
      
      setData(sortedData);
    };
    
    const SortableHeader = ({ column, label }: { column: string, label: string }) => (
      <TableHead className="cursor-pointer" onClick={() => handleSort(column)}>
        {label} {sortColumn === column && (sortDirection === 'asc' ? '↑' : '↓')}
      </TableHead>
    );
    
    return (
      <Table>
        <TableCaption>Click on column headers to sort</TableCaption>
        <TableHeader>
          <TableRow>
            <SortableHeader column="name" label="Name" />
            <SortableHeader column="email" label="Email" />
            <SortableHeader column="role" label="Role" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
};

// Styled Table
export const StyledTable: Story = {
  render: () => (
    <Table className="border rounded-md shadow-sm">
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead className="font-bold">Name</TableHead>
          <TableHead className="font-bold">Status</TableHead>
          <TableHead className="font-bold">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="hover:bg-muted/50">
          <TableCell className="font-medium">John Doe</TableCell>
          <TableCell><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span></TableCell>
          <TableCell><Button variant="outline" size="sm">View</Button></TableCell>
        </TableRow>
        <TableRow className="hover:bg-muted/50">
          <TableCell className="font-medium">Jane Smith</TableCell>
          <TableCell><span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span></TableCell>
          <TableCell><Button variant="outline" size="sm">View</Button></TableCell>
        </TableRow>
        <TableRow className="hover:bg-muted/50">
          <TableCell className="font-medium">Robert Johnson</TableCell>
          <TableCell><span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Inactive</span></TableCell>
          <TableCell><Button variant="outline" size="sm">View</Button></TableCell>
        </TableRow>
      </TableBody>
      <TableFooter className="bg-muted/30">
        <TableRow>
          <TableCell colSpan={3} className="text-right text-sm text-muted-foreground">
            Total: 3 users
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

// Table with Pagination
export const TableWithPagination: Story = {
  render: function Render() {
    const allData = [
      { name: "John Doe", email: "john@example.com", role: "Developer" },
      { name: "Jane Smith", email: "jane@example.com", role: "Designer" },
      { name: "Robert Johnson", email: "robert@example.com", role: "Product Manager" },
      { name: "Emily Adams", email: "emily@example.com", role: "QA Engineer" },
      { name: "Michael Brown", email: "michael@example.com", role: "Developer" },
      { name: "Sarah Wilson", email: "sarah@example.com", role: "UX Designer" },
      { name: "David Thompson", email: "david@example.com", role: "DevOps Engineer" },
      { name: "Lisa Garcia", email: "lisa@example.com", role: "Project Manager" },
    ];
    
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 3;
    const pageCount = Math.ceil(allData.length / itemsPerPage);
    
    const currentPageData = allData.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
    
    return (
      <div className="space-y-2">
        <Table>
          <TableCaption>Table with pagination example</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage + 1} of {pageCount}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.min(pageCount - 1, prev + 1))}
                    disabled={currentPage === pageCount - 1}
                  >
                    Next
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  }
};

