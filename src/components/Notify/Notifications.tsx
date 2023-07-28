import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { socket } from '@/lib/socket';
import type { Notify, User } from '@prisma/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Bell } from 'lucide-react';
import type { Session } from 'next-auth';
import { FC, useEffect, useReducer, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';
import General from './General';

interface NotificationsProps {
  session: Session;
}
export type ExtendedNotify = Pick<Notify, 'type' | 'createdAt' | 'content'> & {
  fromUser: Pick<User, 'name'>;
};

type NotifyAction = {
  type: 'LIKE' | 'COMMENT' | 'MENTION' | 'FOLLOW' | 'SYSTEM';
  payload: any;
};

function reducer(state: any, action: NotifyAction) {
  const { type, payload } = action;

  switch (type) {
    case 'LIKE':
    case 'COMMENT':
    case 'MENTION': {
      return;
    }

    case 'FOLLOW': {
      return;
    }

    case 'SYSTEM': {
      return;
    }

    default:
      return state;
  }
}

const Notifications: FC<NotificationsProps> = ({ session }) => {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [state, dispatch] = useReducer(reducer, {});
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
    socket.on('onlineUsers', (usersLen) => setOnlineUsers(usersLen));
    return () => {
      // socket.off('notify');
      socket.off('onlineUsers');
    };
  }, []);

  useEffect(() => {
    let notifications = notifyData?.pages.flatMap((page) => page);

    notifications = [];
  }, [notifyData?.pages]);

  return (
    <>
      <p>{onlineUsers}</p>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Bell className="w-7 h-7" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="dark:bg-zinc-800 px-0">
          <DropdownMenuLabel className="text-center text-lg dark:text-white">
            Thông báo
          </DropdownMenuLabel>

          <Tabs defaultValue="general">
            <TabsList className="dark:bg-zinc-900 grid grid-cols-3 gap-2">
              <TabsTrigger value="general">Chung</TabsTrigger>
              <TabsTrigger value="follow">Theo dõi</TabsTrigger>
              <TabsTrigger value="system">Hệ thống</TabsTrigger>
            </TabsList>

            {/* <General general={generalNotify} /> */}
          </Tabs>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default Notifications;
