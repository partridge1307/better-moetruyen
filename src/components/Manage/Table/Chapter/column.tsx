'use client';

import { DataTableColumnHeader } from '@/components/DataColumnHeader';
import { formatTimeToNow } from '@/lib/utils';
import type { Chapter } from '@prisma/client';
import type { ColumnDef } from '@tanstack/react-table';
import dynamic from 'next/dynamic';
const DataTableRowAction = dynamic(() => import('./DataTableRowAction'), {
  ssr: false,
});

export type ChapterColumn = Pick<
  Chapter,
  'id' | 'name' | 'images' | 'isPublished' | 'mangaId' | 'updatedAt'
>;

export const columns: ColumnDef<ChapterColumn>[] = [
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
    id: 'Tên chapter',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên chapter" />
    ),
    enableHiding: false,
  },
  {
    id: 'Số lượng ảnh',
    accessorKey: 'image',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số lượng ảnh" />
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.original.images.length}</div>;
    },
    enableSorting: false,
  },
  {
    id: 'Trạng thái',
    accessorKey: 'isPublished',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const formattedStatus = row.getValue('Trạng thái')
        ? 'Đã đăng'
        : 'Chờ đăng';

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
