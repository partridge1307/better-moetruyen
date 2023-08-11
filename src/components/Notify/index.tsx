'use client';

import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import type { Notify, Prisma, User } from '@prisma/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Bell, Loader2 } from 'lucide-react';
import type { Session } from 'next-auth';
import { FC, useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';
import General from './General';
import { socket } from '@/lib/socket';

interface NotificationsProps {
  session: Session;
}
export type ExtendedNotify = Pick<
  Notify,
  'id' | 'type' | 'createdAt' | 'content' | 'isRead'
> & {
  fromUser: Pick<User, 'name'>;
};

export enum notifyType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  MENTION = 'MENTION',
  FOLLOW = 'FOLLOW',
  SYSTEM = 'SYSTEM',
}

const Notifications: FC<NotificationsProps> = ({ session }) => {
  const [generalNotify, setGeneralNotify] = useState<ExtendedNotify[]>([]);
  const [isClear, setIsClear] = useState<boolean>(true);

  const {
    data: notifyData,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['notify-infinite-query'],
    async ({ pageParam = 1 }) => {
      const query = `/api/notify?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}`;

      const { data } = await axios.get(query);
      return data as ExtendedNotify[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
    }
  );

  useEffect(() => {
    socket.connect();

    socket.emit('userConnect', session.user.id);
  }, [session.user]);

  useEffect(() => {
    socket.on(
      'notify',
      (data: {
        type: notifyType;
        data: {
          id: number;
          fromUser: Pick<User, 'name'>;
          mangaId?: number;
          chapterId?: number | null;
        };
      }) => {
        const { id, fromUser, mangaId, chapterId } = data.data;

        if (
          data.type === notifyType.LIKE ||
          data.type === notifyType.MENTION ||
          data.type === notifyType.COMMENT
        ) {
          setGeneralNotify((prev) => [
            {
              id,
              type: data.type,
              createdAt: new Date(Date.now()),
              fromUser: fromUser,
              isRead: false,
              content: {
                mangaId,
                chapterId,
              } as Prisma.JsonValue,
            },
            ...prev,
          ]);
        }

        setIsClear(false);
      }
    );

    return () => {
      socket.off('notify');
    };
  }, []);

  useEffect(() => {
    let notifications = notifyData?.pages.flatMap((page) => page);

    if (notifications?.length) {
      setGeneralNotify(
        notifications?.filter(
          (noti) => noti.type !== 'SYSTEM' && noti.type !== 'FOLLOW'
        )
      );

      notifications.some((noti) => noti.isRead === false) && setIsClear(false);
    }
  }, [notifyData?.pages]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="relative">
          <Bell className="w-7 h-7" />
          {!isClear ? (
            <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
          ) : null}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="dark:bg-zinc-800 p-1 space-y-2"
      >
        <DropdownMenuLabel className="text-center text-lg dark:text-white">
          Thông báo
        </DropdownMenuLabel>

        <Tabs defaultValue="general">
          <TabsList className="dark:bg-zinc-900 grid grid-cols-3 gap-2">
            <TabsTrigger value="general">Chung</TabsTrigger>
            <TabsTrigger value="follow">Theo dõi</TabsTrigger>
            <TabsTrigger value="system">Hệ thống</TabsTrigger>
          </TabsList>

          <General general={generalNotify} />
        </Tabs>

        <Button
          disabled={isFetchingNextPage}
          isLoading={isFetchingNextPage}
          size={'sm'}
          variant={'ghost'}
          className="w-full hover:dark:bg-zinc-900"
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            'Tải thêm'
          )}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
