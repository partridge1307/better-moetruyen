'use client';

import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Check, X } from 'lucide-react';
import { FC, useState } from 'react';
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
import { cn } from '@/lib/utils';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface TeamJoinRequestButtonProps {
  teamId: number;
  userId: string;
}

const TeamJoinRequestButton: FC<TeamJoinRequestButtonProps> = ({
  teamId,
  userId,
}) => {
  const [requestType, setRequestType] = useState<'ACCEPT' | 'REJECT'>('ACCEPT');
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();

  const { mutate: Request, isLoading: isRequesting } = useMutation({
    mutationKey: ['request', userId],
    mutationFn: async (type: 'ACCEPT' | 'REJECT') => {
      await axios.put(`/api/team/${teamId}`, { type, userId });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status == 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Đối tượng đã gia nhập Team',
            description: 'Có vẻ đối tượng đã gia nhập Team này hoặc Team khác',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();

      return successToast();
    },
  });

  return (
    <div className="flex justify-end items-center space-x-4">
      <button
        disabled={isRequesting}
        className={cn(
          'p-1 rounded-full transition-colors hover:dark:bg-zinc-900',
          {
            'opacity-50': isRequesting,
          }
        )}
        onClick={() => {
          const target = document.getElementById(
            'request-button'
          ) as HTMLButtonElement;

          target.click();
          setRequestType('ACCEPT');
        }}
      >
        <Check className="w-8 h-8 text-green-500" />
      </button>
      <button
        disabled={isRequesting}
        className={cn(
          'p-1 rounded-full transition-colors hover:dark:bg-zinc-900',
          {
            'opacity-50': isRequesting,
          }
        )}
        onClick={() => {
          const target = document.getElementById(
            'request-button'
          ) as HTMLButtonElement;

          target.click();
          setRequestType('REJECT');
        }}
      >
        <X className="w-8 h-8 text-red-500" />
      </button>

      <AlertDialog>
        <AlertDialogTrigger id="request-button" className="hidden">
          Request
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận lại yêu cầu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn{' '}
              <span className="font-semibold">
                {requestType === 'ACCEPT'
                  ? 'Chấp nhận'
                  : requestType === 'REJECT'
                  ? 'Từ chối'
                  : null}
              </span>{' '}
              người này hay chưa?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => Request(requestType)}>
              Chắc chắn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamJoinRequestButton;
