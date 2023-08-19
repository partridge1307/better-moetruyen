'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/AlertDialog';
import { buttonVariants } from '../ui/Button';

interface TeamLeaveButtonProps {
  id: number;
}

const TeamLeaveButton: FC<TeamLeaveButtonProps> = ({ id }) => {
  const router = useRouter();
  const { successToast, loginToast, notFoundToast, serverErrorToast } =
    useCustomToast();

  const { mutate: Leave, isLoading: isLeaving } = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/team/${id}`);
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
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(buttonVariants({ variant: 'destructive' }), 'gap-2')}
        disabled={isLeaving}
      >
        <LogOut className="w-5 h-5" /> Rời
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận lại yêu cầu</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn rời Team hay không?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={() => Leave()}>Rời</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TeamLeaveButton;
