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
  mangaId: number;
  isFollow: boolean;
  hasChapter: boolean;
}

const MangaFollow: FC<MangaFollowProps> = ({
  mangaId,
  isFollow,
  hasChapter,
}) => {
  const { loginToast, notFoundToast, rateLimitToast, serverErrorToast } =
    useCustomToast();
  const router = useRouter();

  const [isFollowed, setFollowed] = useState(isFollow);
  const prevFollow = usePrevious(isFollowed);

  const { mutate: Toggle, isPending: isToggling } = useMutation({
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
        className: hasChapter
          ? 'gap-1.5'
          : 'gap-1.5 min-w-[9rem] md:min-w-[11.5rem] lg:min-w-[13.5rem]',
      })}
      disabled={isToggling}
      onClick={() => Toggle('UNFOLLOW')}
    >
      <BookmarkMinus /> Bỏ theo dõi
    </button>
  ) : (
    <button
      className={buttonVariants({
        className: hasChapter
          ? 'gap-1.5'
          : 'gap-1.5 min-w-[9rem] md:min-w-[11.5rem] lg:min-w-[13.5rem]',
      })}
      disabled={isToggling}
      onClick={() => Toggle('FOLLOW')}
    >
      <Bookmark /> Theo dõi
    </button>
  );
};

export default MangaFollow;
