'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { useMutation } from '@tanstack/react-query';
import type { Row } from '@tanstack/react-table';
import axios, { AxiosError } from 'axios';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { UserColumn } from './UserColumn';

interface UserTableRowActionProps {
  row: Row<UserColumn>;
}

const UserTableRowAction: FC<UserTableRowActionProps> = ({ row }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const user = row.original;
  const router = useRouter();

  const { mutate: verify, isLoading: isVerify } = useMutation({
    mutationKey: ['verify', user.userId],
    mutationFn: async ({
      id,
      type,
    }: {
      id: string;
      type: 'ACCEPT' | 'REJECT';
    }) => {
      await axios.patch('/api/admin/user/verify', { id, type });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }
      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();

      return successToast();
    },
  });

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isVerify}
        className="p-1 rounded-full hover:dark:bg-zinc-700"
        onClick={() => verify({ id: user.userId, type: 'ACCEPT' })}
      >
        <Check className="text-green-500" />
      </button>
      <button
        disabled={isVerify}
        className="p-1 rounded-full hover:dark:bg-zinc-700"
        onClick={() => verify({ id: user.userId, type: 'REJECT' })}
      >
        <X className="text-red-500" />
      </button>
    </div>
  );
};

export default UserTableRowAction;
