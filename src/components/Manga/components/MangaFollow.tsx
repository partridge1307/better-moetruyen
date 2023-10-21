'use client';

import { buttonVariants } from '@/components/ui/Button';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { usePrevious } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Bookmark, BookmarkMinus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';

interface MangaFollowProps {
  isFollow: boolean;
  mangaId: number;
}

const MangaFollow: FC<MangaFollowProps> = ({ isFollow, mangaId }) => {
  const { loginToast, notFoundToast, rateLimitToast, serverErrorToast } =
    useCustomToast();
  const router = useRouter();

  const [isFollowed, setFollowed] = useState(isFollow);
  const prevFollow = usePrevious(isFollowed);

  const { mutate: Toggle, isLoading: isToggling } = useMutation({
    mutationKey: ['follow', mangaId],
    mutationFn: async (type: 'FOLLOW' | 'UNFOLLOW') => {
      await axios.post(`/api/user/follow/manga`, { id: mangaId, type });
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
    <button
      className={buttonVariants({
        variant: 'destructive',
        className: 'gap-1.5 w-36 md:w-[11.5rem] lg:w-[13.5rem]',
      })}
      disabled={isToggling}
      onClick={() => Toggle('UNFOLLOW')}
    >
      <BookmarkMinus /> Bỏ theo dõi
    </button>
  ) : (
    <button
      className={buttonVariants({
        className: 'gap-1.5 w-36 md:w-[11.5rem] lg:w-[13.5rem]',
      })}
      disabled={isToggling}
      onClick={() => Toggle('FOLLOW')}
    >
      <Bookmark /> Theo dõi
    </button>
  );
};

export default MangaFollow;
