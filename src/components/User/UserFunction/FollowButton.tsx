'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { usePrevious } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Heart, HeartOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { Button } from '../../ui/Button';

interface FollowButtonProps {
  isFollowing: boolean;
  userId: string;
}

const FollowButton: FC<FollowButtonProps> = ({ isFollowing, userId }) => {
  const router = useRouter();
  const { loginToast, notFoundToast, rateLimitToast, serverErrorToast } =
    useCustomToast();
  const [isFollowed, setFollowed] = useState(isFollowing);
  const prevFollow = usePrevious(isFollowed);

  const { mutate: Toggle, isPending: isToggling } = useMutation({
    mutationKey: ['follow-user', userId],
    mutationFn: async (type: 'FOLLOW' | 'UNFOLLOW') => {
      await axios.post('/api/user/follow', {
        id: userId,
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
      className="w-[30%] md:w-[15%]"
      onClick={() => Toggle('UNFOLLOW')}
    >
      <HeartOff />
    </Button>
  ) : (
    <Button
      disabled={isToggling}
      className="w-[30%] md:w-[15%]"
      onClick={() => Toggle('FOLLOW')}
    >
      <Heart />
    </Button>
  );
};

export default FollowButton;
