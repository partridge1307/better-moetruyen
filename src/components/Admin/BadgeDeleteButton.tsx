'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

interface BadgeDeleteButtonProps {
  id: number;
}

const BadgeDeleteButton: FC<BadgeDeleteButtonProps> = ({ id }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();

  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationKey: ['delete-badge', id],
    mutationFn: async () => {
      await axios.delete(`/api/admin/user/badge`, { data: { id } });
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
    <button disabled={isDeleting} onClick={() => Delete()}>
      <Trash2 className="w-5 h-5 text-red-500" />
    </button>
  );
};

export default BadgeDeleteButton;
