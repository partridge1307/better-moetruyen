'use client';

import { buttonVariants } from '@/components/ui/Button';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { FollowPayload } from '@/lib/validators/vote';
import { usePrevious } from '@mantine/hooks';
import type { MangaFollow } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Heart, HeartOff } from 'lucide-react';
import { FC, useState } from 'react';

interface MangaFollowProps {
  follow: MangaFollow | null;
  mangaId: number;
}

const MangaFollow: FC<MangaFollowProps> = ({ follow, mangaId }) => {
  const { loginToast, notFoundToast, serverErrorToast } = useCustomToast();

  const [currentFollow, setCurrentFollow] = useState<
    'FOLLOW' | 'UNFOLLOW' | undefined
  >(follow ? 'FOLLOW' : 'UNFOLLOW');
  const prevFollow = usePrevious(currentFollow);

  const { mutate: Handle, isLoading: isHanling } = useMutation({
    mutationKey: ['follow', mangaId],
    mutationFn: async () => {
      const payload: FollowPayload = {
        id: mangaId,
        target: 'MANGA',
      };

      await axios.post(`/api/user/follow`, payload);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      setCurrentFollow(prevFollow);

      return serverErrorToast();
    },
    onMutate: (type: 'FOLLOW' | 'UNFOLLOW') => {
      if (type === 'FOLLOW') return setCurrentFollow('FOLLOW');
      if (type === 'UNFOLLOW') return setCurrentFollow('UNFOLLOW');
    },
  });

  return currentFollow === 'FOLLOW' ? (
    <button
      className={buttonVariants({ variant: 'ghost' })}
      disabled={isHanling}
      onClick={() => Handle('UNFOLLOW')}
    >
      <HeartOff className="w-5 h-5" />
    </button>
  ) : (
    <button
      className={buttonVariants({ variant: 'ghost' })}
      disabled={isHanling}
      onClick={() => Handle('FOLLOW')}
    >
      <Heart className="w-5 h-5 dark:text-[#F08484]" />
    </button>
  );
};

export default MangaFollow;
