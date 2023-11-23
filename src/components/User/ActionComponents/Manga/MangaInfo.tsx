'use client';

import MangaCard from '@/components/Manga/components/MangaCard';
import MangaCardSkeleton from '@/components/Skeleton/MangaCardSkeleton';
import { TabsContent } from '@/components/ui/Tabs';
import { UserInfoEnum, useUserInfo } from '@/hooks/use-user-info';
import { useIntersection } from '@mantine/hooks';
import { Chapter, Manga } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';

type TManga = Pick<
  Manga,
  'id' | 'slug' | 'image' | 'name' | 'review' | 'createdAt'
> & {
  chapter: Pick<
    Chapter,
    'id' | 'volume' | 'chapterIndex' | 'name' | 'createdAt'
  >[];
};

interface MangaInfoProps {
  userId: string;
  initialData: {
    data: TManga[];
    lastCursor?: number;
  };
}

const MangaInfo: FC<MangaInfoProps> = ({ userId, initialData }) => {
  const lastMangaRef = useRef(null);
  const { ref, entry } = useIntersection({
    root: lastMangaRef.current,
    threshold: 1,
  });

  const { data, query } = useUserInfo({
    userId,
    type: UserInfoEnum.MANGA,
    initialData,
  });

  useEffect(() => {
    if (entry?.isIntersecting && query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [entry?.isIntersecting, query]);

  return (
    <TabsContent
      value="manga"
      forceMount
      className="data-[state=inactive]:hidden p-2 rounded-md bg-primary-foreground/50"
    >
      {!query.isFetching && !data.length && (
        <p>Người dùng này hiện chưa có Truyện nào</p>
      )}

      {query.isFetching && <MangaCardSkeleton />}

      {!query.isFetching && !!data.length && (
        <ul className="grid md:grid-cols-2 gap-4 md:gap-6">
          {data.map((manga, index) => {
            if (index === data.length - 1)
              return (
                <li ref={ref} key={manga.id}>
                  <MangaCard manga={manga} />
                </li>
              );

            return (
              <li key={manga.id}>
                <MangaCard manga={manga} />
              </li>
            );
          })}
        </ul>
      )}

      {query.isFetchingNextPage && <Loader2 className="animate-spin" />}
    </TabsContent>
  );
};

export default MangaInfo;
