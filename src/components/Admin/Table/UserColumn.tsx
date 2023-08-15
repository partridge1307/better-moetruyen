'use client';

import { DataTableColumnHeader } from '@/components/DataColumnHeader';
import { formatTimeToNow } from '@/lib/utils';
import type { User, VerifyList } from '@prisma/client';
import type { ColumnDef } from '@tanstack/react-table';
import UserTableRowAction from './UserTableRowAction';

export type UserColumn = VerifyList & {
  user: Pick<User, 'name'>;
};

export const columns: ColumnDef<UserColumn>[] = [
  {
    id: 'userId',
    accessorKey: 'userId',
    header: 'userId',
  },
  {
    id: 'name',
    accessorKey: 'user',
    header: 'name',
    cell: ({ row }) => row.original.user.name,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="createdAt" />
    ),
    cell: ({ row }) => {
      const formattedDate = formatTimeToNow(row.getValue('createdAt'));
      return <div>{formattedDate}</div>;
    },
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <UserTableRowAction row={row} />,
    enableHiding: false,
  },
];
