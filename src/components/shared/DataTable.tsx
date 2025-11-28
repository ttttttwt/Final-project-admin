/**
 * DataTable Component
 * Reusable data table with pagination, sorting, and loading states
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/**
 * Column definition for the data table
 */
export interface ColumnDef<T> {
  /** Unique key for the column, used to access data */
  accessorKey: keyof T | string;
  /** Column header label */
  header: string;
  /** Custom cell renderer */
  cell?: (row: T) => React.ReactNode;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Column width class */
  className?: string;
}

/**
 * Pagination state
 */
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

interface DataTableProps<T> {
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Data array */
  data: T[];
  /** Pagination state */
  pagination: PaginationState;
  /** Callback when pagination changes */
  onPaginationChange: (page: number, size: number) => void;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Unique key accessor for rows */
  getRowId?: (row: T) => string | number;
  /** Empty state message */
  emptyMessage?: string;
  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void;
}

/**
 * DataTable - A reusable table component with pagination
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   data={users}
 *   pagination={{ pageIndex: 0, pageSize: 10, totalPages: 5, totalElements: 50 }}
 *   onPaginationChange={(page, size) => setParams({ page, size })}
 *   isLoading={isLoading}
 * />
 * ```
 */
export function DataTable<T>({
  columns,
  data,
  pagination,
  onPaginationChange,
  isLoading = false,
  getRowId,
  emptyMessage = "No results found.",
  onRowClick,
}: DataTableProps<T>) {
  const pageSizeOptions = [10, 25, 50];

  // Get cell value from row
  const getCellValue = (row: T, accessorKey: string): React.ReactNode => {
    const keys = accessorKey.split(".");
    let value: unknown = row;
    for (const key of keys) {
      if (value && typeof value === "object") {
        value = (value as Record<string, unknown>)[key];
      } else {
        value = undefined;
        break;
      }
    }
    return value as React.ReactNode;
  };

  // Generate row key
  const getRowKey = (row: T, index: number): string | number => {
    if (getRowId) {
      return getRowId(row);
    }
    // Try to find an 'id' property
    if (typeof row === "object" && row !== null && "id" in row) {
      return (row as Record<string, unknown>).id as string | number;
    }
    return index;
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={String(column.accessorKey)}
                    className={column.className}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pagination.pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.accessorKey)}
                      className={column.className}
                    >
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.accessorKey)}
                  className={column.className}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={getRowKey(row, index)}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                  }
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.accessorKey)}
                      className={column.className}
                    >
                      {column.cell
                        ? column.cell(row)
                        : getCellValue(row, String(column.accessorKey))}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => onPaginationChange(0, parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pagination.pageSize.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {pagination.pageIndex + 1} of {pagination.totalPages || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPaginationChange(0, pagination.pageSize)}
              disabled={pagination.pageIndex === 0}
              aria-label="Go to first page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                onPaginationChange(
                  pagination.pageIndex - 1,
                  pagination.pageSize
                )
              }
              disabled={pagination.pageIndex === 0}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                onPaginationChange(
                  pagination.pageIndex + 1,
                  pagination.pageSize
                )
              }
              disabled={pagination.pageIndex >= pagination.totalPages - 1}
              aria-label="Go to next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() =>
                onPaginationChange(
                  pagination.totalPages - 1,
                  pagination.pageSize
                )
              }
              disabled={pagination.pageIndex >= pagination.totalPages - 1}
              aria-label="Go to last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
