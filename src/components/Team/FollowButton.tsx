'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { usePrevious } from '@mantine/hooks';
import type { Team, User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Heart, HeartOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { Button } from '../ui/Button';

interface FollowButtonProps {
  team: Pick<Team, 'id'> & {
    follows: Pick<User, 'id'>[];
  };
  sessionUserId: string;
}

const FollowButton: FC<FollowButtonProps> = ({ team, sessionUserId }) => {
  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast } = useCustomToast();

  const [isFollowed, setFollowed] = useState(
    team.follows.some((user) => user.id === sessionUserId)
  );
  const prevFollow = usePrevious(isFollowed);

  const { mutate: Toggle, isLoading: isToggling } = useMutation({
    mutationKey: ['team-follow', team.id],
    mutationFn: async (type: 'FOLLOW' | 'UNFOLLOW') => {
      await axios.post('/api/user/follow/team', {
        id: team.id,
        type,
      });
    },
    onError: (err) => {
      setFollowed(prevFollow ?? false);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onMutate: (type) => {
      if (type === 'FOLLOW') return setFollowed(true);
      else return setFollowed(false);
    },
    onSuccess: () => {
      return router.refresh();
    },
  });

  return isFollowed ? (
    <Button
      variant={'destructive'}
      disabled={isToggling}
      onClick={() => Toggle('UNFOLLOW')}
    >
      <HeartOff />
    </Button>
  ) : (
    <Button disabled={isToggling} onClick={() => Toggle('FOLLOW')}>
      <Heart />
    </Button>
  );
};

export default FollowButton;
