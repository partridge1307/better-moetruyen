'use client';

import { Button } from '@/components/ui/Button';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import type { Team, User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

interface JoinLeaveButtonProps {
  user: Pick<User, 'teamId'>;
  team: Pick<Team, 'id'>;
}

const JoinLeaveButton: FC<JoinLeaveButtonProps> = ({ user, team }) => {
  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();

  const { mutate: Toggle, isPending: isToggling } = useMutation({
    mutationKey: ['join-leave-team', team.id],
    mutationFn: async (type: 'JOIN' | 'LEAVE') => {
      const { status } = await axios.post(`/api/team/${team.id}/action`, {
        type,
      });

      return status;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 403)
          return toast({
            title: 'Từ chối yêu cầu',
            description: 'Bạn đã gia nhâọ Team này hoặc Team khác rồi',
            variant: 'destructive',
          });
        if (err.response?.status === 418)
          return toast({
            title: 'Hmmm',
            description: 'Bạn là chủ Team này',
            variant: 'destructive',
          });
        if (err.response?.status === 409)
          return toast({
            title: 'Từ chối yêu cầu',
            description: 'Bạn đã gửi yêu cầu rồi',
            variant: 'destructive',
          });
        if (err.response?.status === 406)
          return toast({
            title: 'Từ chối yêu cầu',
            description: 'Bạn không ở trong Team này',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: (status) => {
      router.refresh();

      if (status === 201)
        return toast({
          title: 'Yêu cầu thành công',
          description: 'Bạn đã gửi yêu cầu gia nhập tới Team này',
        });

      return successToast();
    },
  });

  return (
    <>
      {!user.teamId && (
        <Button
          className="md:w-[18.5%]"
          disabled={isToggling}
          isLoading={isToggling}
          onClick={() => Toggle('JOIN')}
        >
          Xin gia nhập
        </Button>
      )}
      {user.teamId === team.id && (
        <Button
          variant={'destructive'}
          className="md:w-[18.5%]"
          disabled={isToggling}
          isLoading={isToggling}
          onClick={() => Toggle('LEAVE')}
        >
          Rời Team
        </Button>
      )}
    </>
  );
};

export default JoinLeaveButton;
