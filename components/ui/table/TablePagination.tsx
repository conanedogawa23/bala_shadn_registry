import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

/**
 * Props for the TablePagination component
 * @interface TablePaginationProps
 */
export interface TablePaginationProps {
  /**
   * Current page number (1-based)
   */
  currentPage: number
  
  /**
   * Total number of pages
   */
  totalPages: number
  
  /**
   * Number of items shown per page
   */
  pageSize: number
  
  /**
   * Available options for page size selection
   */
  pageSizeOptions?: number[]
  
  /**
   * Callback function triggered when page changes
   * @param page New page number
   */
  onPageChange: (page: number) => void
  
  /**
   * Callback function triggered when page size changes
   * @param size New page size
   */
  onPageSizeChange: (size: number) => void
  
  /**
   * Optional className for custom styling
   */
  className?: string
  
  /**
   * Disables all pagination controls
   */
  disabled?: boolean
  
  /**
   * Shows/hides the page size selector
   */
  showPageSizeSelector?: boolean
  
  /**
   * Shows/hides the page number input
   */
  showPageInput?: boolean
}

/**
 * TablePagination component provides navigation controls for paginated tables.
 * It includes next/previous buttons, current page display, total pages count,
 * and page size selection.
 * 
 * @example
 * ```tsx
 * <TablePagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   pageSize={pageSize}
 *   onPageChange={handlePageChange}
 *   onPageSizeChange={handlePageSizeChange}
 *   pageSizeOptions={[10, 20, 50, 100]}
 * />
 * ```
 */
export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className = '',
  disabled = false,
  showPageSizeSelector = true,
  showPageInput = true,
}: TablePaginationProps) {
  // Handler for the previous page button
  const handlePreviousPage = () => {
    if (currentPage > 1 && !disabled) {
      onPageChange(currentPage - 1)
    }
  }

  // Handler for the next page button
  const handleNextPage = () => {
    if (currentPage < totalPages && !disabled) {
      onPageChange(currentPage + 1)
    }
  }

  // Handler for direct page input
  const handlePageInputChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      const target = e.target as HTMLInputElement
      const pageNumber = parseInt(target.value, 10)
      
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        onPageChange(pageNumber)
      } else {
        // Reset the input to current page if invalid
        target.value = currentPage.toString()
      }
    }
  }

  // Handler for page size changes
  const handlePageSizeChange = (value: string) => {
    if (!disabled) {
      const newSize = parseInt(value, 10)
      onPageSizeChange(newSize)
    }
  }

  return (
    <div 
      className={`flex items-center justify-between space-x-4 py-4 ${className}`}
      aria-label="Table pagination"
    >
      <div className="flex items-center space-x-2">
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 w-[70px]" aria-label="Select page size">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <span>
            Page{' '}
            <strong>
              {currentPage} of {totalPages}
            </strong>
          </span>
        </div>
        
        {showPageInput && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Go to page</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              defaultValue={currentPage}
              className="h-8 w-16"
              onKeyDown={handlePageInputChange}
              disabled={disabled}
              aria-label="Go to page number"
            />
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1 || disabled}
            aria-label="Previous page"
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || disabled}
            aria-label="Next page"
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

