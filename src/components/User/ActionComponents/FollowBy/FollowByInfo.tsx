'use client';

import { TabsContent } from '@/components/ui/Tabs';
import { UserInfoEnum, useUserInfo } from '@/hooks/use-user-info';
import { useIntersection } from '@mantine/hooks';
import { User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';
import UserCard from './UserCard';
import UserFollowSkeleton from '@/components/Skeleton/UserFollowSkeleton';

export type TUser = Pick<User, 'id' | 'banner' | 'image' | 'name' | 'color'>;

interface FollowByInfoProps {
  userId: string;
  initialData: {
    data: TUser[];
    lastCursor?: string;
  };
}

const FollowByInfo: FC<FollowByInfoProps> = ({ userId, initialData }) => {
  const lastUserRef = useRef(null);
  const { ref, entry } = useIntersection({
    root: lastUserRef.current,
    threshold: 1,
  });

  const { data, query } = useUserInfo({
    userId,
    initialData,
    type: UserInfoEnum.FOLLOW_BY,
  });

  useEffect(() => {
    if (entry?.isIntersecting && query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [entry?.isIntersecting, query]);

  return (
    <TabsContent
      value="followBy"
      forceMount
      className="data-[state=inactive]:hidden p-2 rounded-md bg-primary-foreground/50"
    >
      {!query.isFetching && !data.length && (
        <p>Người dùng này hiện chưa có ai theo dõi</p>
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

export default FollowByInfo;
