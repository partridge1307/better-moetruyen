'use client';

import { Button } from '@/components/ui/Button';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { usePrevious } from '@mantine/hooks';
import type { Team } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Heart, HeartOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';

interface FollowButtonProps {
  team: Pick<Team, 'id'>;
  isFollow: boolean;
}

const FollowButton: FC<FollowButtonProps> = ({ team, isFollow }) => {
  const { loginToast, notFoundToast, serverErrorToast, rateLimitToast } =
    useCustomToast();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(isFollow);
  const prevFollow = usePrevious(isFollowing);

  const { mutate: Toggle, isPending: isToggling } = useMutation({
    mutationKey: ['team-follow', team.id],
    mutationFn: async (type: 'FOLLOW' | 'UNFOLLOW') => {
      await axios.post('/api/user/follow/team', {
        id: team.id,
        type,
      });
    },
    onError: (err) => {
      setIsFollowing(prevFollow ?? false);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 429) return rateLimitToast();
      }

      return serverErrorToast();
    },
    onMutate: (type) => {
      if (type === 'FOLLOW') return setIsFollowing(true);
      else return setIsFollowing(false);
    },
    onSuccess: () => {
      return router.refresh();
    },
  });

  return isFollowing ? (
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
