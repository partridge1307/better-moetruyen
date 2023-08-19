'use client';

import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { Button } from '../ui/Button';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface TeamJoinButtonProps {
  teamId: number;
}

const TeamJoinButton: FC<TeamJoinButtonProps> = ({ teamId }) => {
  const { loginToast, serverErrorToast, successToast } = useCustomToast();
  const router = useRouter();

  const { mutate: Join, isLoading: isJoining } = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/team/${teamId}`);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Bạn đã gia nhập Team',
            description:
              'Có vẻ như bạn đã gia nhập Team này hoặc Team khác rồi',
            variant: 'destructive',
          });
        if (err.response?.status === 400)
          return toast({
            title: 'Đã gửi yêu gia nhập trước đó',
            description: 'Bạn đã gửi yêu cầu gia nhập Team này trước đó',
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
    <Button isLoading={isJoining} disabled={isJoining} onClick={() => Join()}>
      Gia nhập
    </Button>
  );
};

export default TeamJoinButton;
