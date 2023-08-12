'use client';

import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { socket } from '@/lib/socket';
import { useIntersection } from '@mantine/hooks';
import type { Conversation, Message, User } from '@prisma/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Session } from 'next-auth';
import dynamic from 'next/dist/shared/lib/dynamic';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useRef, useState } from 'react';
import { ScrollArea } from '../ui/ScrollArea';
import MessageCard from './MessageCard';
const ChatForm = dynamic(() => import('./ChatForm'), {
  ssr: false,
  loading: () => (
    <template className="h-14 w-full px-2 rounded-md dark:bg-zinc-900 animate-pulse" />
  ),
});

type ExtendedMessage = Pick<Message, 'content' | 'createdAt'> & {
  sender: Pick<User, 'id' | 'name' | 'image' | 'color'>;
};

interface MessageListProps {
  conversation: Pick<Conversation, 'id'> & {
    users: Pick<User, 'id' | 'name' | 'color'>[];
  };
  me: Pick<User, 'id'>;
  session: Session;
}

const MessageList: FC<MessageListProps> = ({ conversation, me, session }) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const lastMessageRef = useRef<HTMLLIElement | null>(null);
  const firstMessageRef = useRef<HTMLLIElement | null>(null);

  const { ref, entry } = useIntersection({
    threshold: 1,
    root: firstMessageRef.current,
  });

  const {
    data: messageData,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(
    ['infinite-message-query', `${conversation.id}`],
    async ({ pageParam = 1 }) => {
      const query = `/api/conversation/message?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}&id=${conversation.id}`;

      const { data } = await axios.get(query);
      return data as ExtendedMessage[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
    }
  );

  useEffect(() => {
    setTimeout(
      () => lastMessageRef.current?.scrollIntoView({ behavior: 'instant' }),
      500
    );
  }, []);
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  useEffect(() => {
    const msgData = messageData?.pages.flatMap((page) => page);

    if (msgData?.length) {
      setMessages(
        msgData.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
    }
  }, [messageData?.pages]);

  useEffect(() => {
    router.refresh();
    socket.connect();

    socket.on(
      `message:${conversation.id}`,
      (data: {
        content: string;
        sender: Pick<User, 'id' | 'name' | 'color' | 'image'>;
      }) => {
        const { content, sender } = data;

        setMessages((prev) => [
          ...prev,
          {
            content,
            createdAt: new Date(Date.now()),
            sender,
          },
        ]);
        setTimeout(() => {
          lastMessageRef.current?.scrollIntoView({ behavior: 'instant' });
        }, 0);
      }
    );

    return () => {
      socket.off(`message:${conversation.id}`);
      socket.close();
    };
  }, [conversation.id, router]);

  return (
    <>
      <ScrollArea
        type="scroll"
        scrollHideDelay={300}
        className="flex-1 overflow-y-auto"
      >
        <ul className="flex flex-col gap-4 p-2 px-4">
          {messages.map((message, index) => {
            const sender = message.sender;

            if (index === 0) {
              return (
                <li ref={ref} key={index} className="flex gap-2">
                  <MessageCard
                    message={message}
                    isMe={sender.id === me.id}
                    sender={sender}
                  />
                </li>
              );
            } else if (index === messages.length - 1) {
              return (
                <li ref={lastMessageRef} key={index} className="flex gap-2">
                  <MessageCard
                    message={message}
                    isMe={sender.id === me.id}
                    sender={sender}
                  />
                </li>
              );
            } else {
              return (
                <li key={index} className="flex gap-2">
                  <MessageCard
                    message={message}
                    isMe={sender.id === me.id}
                    sender={sender}
                  />
                </li>
              );
            }
          })}
        </ul>
      </ScrollArea>

      <ChatForm
        conversation={conversation}
        session={session}
        refetch={refetch}
      />
    </>
  );
};

export default MessageList;
