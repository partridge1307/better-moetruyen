'use client';

import UserFollowSkeleton from '@/components/Skeleton/UserFollowSkeleton';
import { TabsContent } from '@/components/ui/Tabs';
import { UserInfoEnum, useUserInfo } from '@/hooks/use-user-info';
import { useIntersection } from '@mantine/hooks';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';
import type { TUser } from '../FollowBy/FollowByInfo';
import UserCard from '../FollowBy/UserCard';

interface FollowingInfoProps {
  userId: string;
  initialData: {
    data: TUser[];
    lastCursor?: string;
  };
}

const FollowingInfo: FC<FollowingInfoProps> = ({ userId, initialData }) => {
  const lastUserRef = useRef(null);
  const { ref, entry } = useIntersection({
    root: lastUserRef.current,
    threshold: 1,
  });

  const { data, query } = useUserInfo({
    userId,
    initialData,
    type: UserInfoEnum.FOLLOWING,
  });

  useEffect(() => {
    if (entry?.isIntersecting && query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [entry?.isIntersecting, query]);

  return (
    <TabsContent
      value="following"
      forceMount
      className="data-[state=inactive]:hidden p-2 rounded-md bg-primary-foreground/50"
    >
      {!query.isFetching && !data.length && (
        <p>Người dùng này hiện chưa theo dõi ai</p>
      )}

      {query.isFetching && <UserFollowSkeleton />}

      {!query.isFetching && !!data.length && (
        <ul className="grid md:grid-cols-3 gap-6">
          {data.map((user, index) => {
            if (index === data.length - 1)
              return (
                <li ref={ref} key={user.id}>
                  <UserCard user={user} />
                </li>
              );

            return (
              <li key={user.id}>
                <UserCard user={user} />
              </li>
            );
          })}
        </ul>
      )}

      {query.isFetchingNextPage && <Loader2 className="animate-spin" />}
    </TabsContent>
  );
};

export default FollowingInfo;
