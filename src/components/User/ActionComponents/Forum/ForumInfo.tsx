'use client';

import { TabsContent } from '@/components/ui/Tabs';
import { UserInfoEnum, useUserInfo } from '@/hooks/use-user-info';
import { useIntersection } from '@mantine/hooks';
import type { SubForum } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';
import ForumCard from './ForumCard';
import UserForumSkeleton from '@/components/Skeleton/UserForumSkeleton';

export type TForum = Pick<SubForum, 'id' | 'slug' | 'banner' | 'title'> & {
  _count: {
    subscriptions: number;
  };
};

interface ForumInfoProps {
  userId: string;
  initialData: {
    data: TForum[];
    lastCursor?: number;
  };
}

const ForumInfo: FC<ForumInfoProps> = ({ userId, initialData }) => {
  const lastForumRef = useRef(null);
  const { ref, entry } = useIntersection({
    root: lastForumRef.current,
    threshold: 1,
  });

  const { data, query } = useUserInfo({
    userId,
    initialData,
    type: UserInfoEnum.FORUM,
  });

  useEffect(() => {
    if (entry?.isIntersecting && query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [entry?.isIntersecting, query]);

  return (
    <TabsContent
      value="forum"
      forceMount
      className="data-[state=inactive]:hidden p-2 rounded-md bg-primary-foreground/50"
    >
      {!query.isFetching && !data.length && (
        <p>Người dùng này hiện chưa có Forum nào</p>
      )}

      {query.isFetching && <UserForumSkeleton />}

      {!query.isFetching && !!data.length && (
        <ul className="grid md:grid-cols-2 gap-6">
          {data.map((forum, index) => {
            if (index === data.length - 1)
              return (
                <li ref={ref} key={forum.id}>
                  <ForumCard forum={forum} />
                </li>
              );
            return (
              <li key={forum.id}>
                <ForumCard forum={forum} />
              </li>
            );
          })}
        </ul>
      )}

      {query.isFetchingNextPage && <Loader2 className="animate-spin" />}
    </TabsContent>
  );
};

export default ForumInfo;
