'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { FollowPayload } from '@/lib/validators/vote';
import type { MangaFollow } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Heart, HeartOff } from 'lucide-react';
import { FC, useState } from 'react';
import { Button } from '../ui/Button';

enum FollowType {
  FOLLOW = 'FOLLOW',
  UNFOLLOW = 'UNFOLLOW',
}

interface FollowClientProps {
  follow: MangaFollow | null;
  mangaId: number;
}

const FollowClient: FC<FollowClientProps> = ({ follow, mangaId }) => {
  axios.post(`/api/manga/${mangaId}/history`).catch(() => {});

  const { loginToast, notFoundToast } = useCustomToast();
  const [currentFollow, setCurrentFollow] = useState<FollowType>(
    follow ? FollowType.FOLLOW : FollowType.UNFOLLOW
  );

  const { mutate: Create } = useMutation({
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

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
        variant: 'destructive',
      });
    },
    onMutate: (type: FollowType) => {
      if (type === FollowType.FOLLOW) setCurrentFollow(FollowType.FOLLOW);
      if (type === FollowType.UNFOLLOW) setCurrentFollow(FollowType.UNFOLLOW);
    },
  });

  return (
    <div>
      {currentFollow === FollowType.FOLLOW ? (
        <Button onClick={() => Create(FollowType.UNFOLLOW)}>
          <HeartOff className="w-5 h-5" />
        </Button>
      ) : (
        <Button onClick={() => Create(FollowType.FOLLOW)}>
          <Heart className="w-5 h-5 text-red-600" />
        </Button>
      )}
    </div>
  );
};

export default FollowClient;
