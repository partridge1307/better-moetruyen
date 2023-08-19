'use client';

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/Table';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FC, useState } from 'react';
import { UserColumn, columns } from './UserColumn';
import { Input } from '@/components/ui/Input';
const TableDataHeader = dynamic(() => import('@/components/TableDataHeader'), {
  ssr: false,
});
const TablePagination = dynamic(() => import('@/components/TablePagination'), {
  ssr: false,
});

interface DataUserTableProps {
  data: UserColumn[];
}

const DataUserTable: FC<DataUserTableProps> = ({ data }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilter] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-2">
      <div className="p-2">
        <Input
          placeholder="Lọc tên user"
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(e) =>
            table.getColumn('name')?.setFilterValue(e.target.value)
          }
          className="rounded-xl"
        />
      </div>

      <Table>
        <TableDataHeader table={table} />

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => {
                  if (cell.column.id === 'actions') {
                    return (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  } else {
                    return (
                      <TableCell key={cell.id}>
                        <Link
                          href={`/user/${row.original.user.name
                            ?.split(' ')
                            .join('-')}`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Link>
                      </TableCell>
                    );
                  }
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>Không có kết quả</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination table={table} />
    </div>
  );
};

export default DataUserTable;
