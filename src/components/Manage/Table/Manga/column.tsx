'use client';

import { DataTableColumnHeader } from '@/components/DataColumnHeader';
import { formatTimeToNow } from '@/lib/utils';
import type { Manga } from '@prisma/client';
import type { ColumnDef } from '@tanstack/react-table';
import DataTableRowAction from './DataTableRowAction';

export type MangaColumn = Pick<
  Manga,
  'id' | 'name' | 'isPublished' | 'updatedAt'
>;

export const columns: ColumnDef<MangaColumn>[] = [
  {
    id: 'ID',
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div>{row.getValue('ID')}</div>,
    enableHiding: false,
  },
  {
    id: 'Tên truyện',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên truyện" />
    ),
    enableHiding: false,
  },
  {
    id: 'Trạng thái',
    accessorKey: 'isPublished',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const formattedStatus = row.getValue('Trạng thái')
        ? 'Đã đăng'
        : 'Chờ publish';

      return <div>{formattedStatus}</div>;
    },
  },
  {
    id: 'Cập nhật',
    accessorKey: 'updatedAt',
    header: 'Cập nhật',
    cell: ({ row }) => {
      const formattedDate = formatTimeToNow(row.getValue('Cập nhật'));
      return <div>{formattedDate}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowAction row={row} />,
    enableHiding: false,
  },
];
