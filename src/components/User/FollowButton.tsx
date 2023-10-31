'use client';

import { User } from '@prisma/client';
import { FC, useState } from 'react';
import { Button } from '../ui/Button';
import { Heart, HeartOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { usePrevious } from '@mantine/hooks';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
  user: Pick<User, 'id'> & {
    followedBy: Pick<User, 'id'>[];
  };
  sessionUserId: string;
  hasBadge: boolean;
}

const FollowButton: FC<FollowButtonProps> = ({
  user,
  sessionUserId,
  hasBadge,
}) => {
  const router = useRouter();
  const { loginToast, notFoundToast, rateLimitToast, serverErrorToast } =
    useCustomToast();
  const [isFollowed, setFollowed] = useState(
    user.followedBy.some((user) => user.id === sessionUserId)
  );
  const prevFollow = usePrevious(isFollowed);

  const { mutate: Toggle, isPending: isToggling } = useMutation({
    mutationKey: ['follow-user', user.id],
    mutationFn: async (type: 'FOLLOW' | 'UNFOLLOW') => {
      await axios.post('/api/user/follow', {
        id: user.id,
        type,
      });
    },
    onError: (err) => {
      setFollowed(prevFollow ?? false);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 429) return rateLimitToast();
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
      className={`${hasBadge ? 'mt-3' : 'mt-16'} w-full mb-2`}
      onClick={() => Toggle('UNFOLLOW')}
    >
      <HeartOff />
    </Button>
  ) : (
    <Button
      disabled={isToggling}
      className={`${hasBadge ? 'mt-3' : 'mt-16'} w-full mb-2`}
      onClick={() => Toggle('FOLLOW')}
    >
      <Heart />
    </Button>
  );
};

export default FollowButton;
