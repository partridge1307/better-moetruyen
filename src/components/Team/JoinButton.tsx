'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import type { Team, User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { LogIn, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { Button } from '../ui/Button';

interface JoinButtonProps {
  team: Pick<Team, 'id'> & {
    member: Pick<User, 'id'>[];
  };
  sessionUserId: string;
}

const JoinButton: FC<JoinButtonProps> = ({ team, sessionUserId }) => {
  const isJoined = team.member.some((member) => member.id === sessionUserId);

  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();

  const { mutate: Toggle, isPending: isToggling } = useMutation({
    mutationKey: ['team-join', team.id],
    mutationFn: async (type: 'JOIN' | 'LEAVE') => {
      const { status } = await axios.post('/api/team', {
        id: team.id,
        type,
      });

      return status;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Không thể thực hiện',
            description: 'Bạn gia nhập Team rồi',
            variant: 'destructive',
          });
        if (err.response?.status === 409)
          return toast({
            title: 'Không thể thực hiện',
            description: 'Bạn đã gửi yêu cầu gia nhập trước đó rồi',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: (status) => {
      router.refresh();

      if (status === 201)
        return toast({
          title: 'Thành công',
          description: 'Đã gửi yêu cầu gia nhập',
        });
      else return successToast();
    },
  });

  return isJoined ? (
    <Button
      variant={'destructive'}
      disabled={isToggling}
      onClick={() => Toggle('LEAVE')}
      className="space-x-2"
    >
      <LogOut /> <span>Rời</span>
    </Button>
  ) : (
    <Button
      disabled={isToggling}
      onClick={() => Toggle('JOIN')}
      className="space-x-2"
    >
      <LogIn /> <span>Gia nhập</span>
    </Button>
  );
};

export default JoinButton;
