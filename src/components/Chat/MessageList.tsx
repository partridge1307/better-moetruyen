'use client';

import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { socket } from '@/lib/socket';
import { useIntersection } from '@mantine/hooks';
import type { Conversation, Message, User } from '@prisma/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import { ScrollArea } from '../ui/ScrollArea';
import MessageCard from './MessageCard';

type ExtendedMessage = Pick<Message, 'content' | 'createdAt'> & {
  sender: Pick<User, 'id' | 'name' | 'image' | 'color'>;
};

interface MessageListProps {
  conversation: Pick<Conversation, 'id'> & {
    users: Pick<User, 'id' | 'name' | 'color'>[];
    messages: ExtendedMessage[];
  };
  me: Pick<User, 'id'>;
}

const MessageList: FC<MessageListProps> = ({ conversation, me }) => {
  const [messages, setMessages] = useState(conversation.messages);
  const lastMessageRef = useRef<HTMLLIElement | null>(null);
  const firstMessageRef = useRef<HTMLLIElement | null>(null);
  const { ref, entry } = useIntersection({
    threshold: 1,
    root: firstMessageRef.current,
  });

  const {
    data: messageData,
    fetchNextPage,
    isFetchingNextPage,
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
    socket.connect();

    socket.on(
      'message',
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
      }
    );

    return () => {
      socket.off('message');
    };
  }, []);
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);
  useEffect(() => {
    const msgData = messageData?.pages.flatMap((page) => page).reverse();

    if (msgData?.length) {
      setMessages(msgData);
    }
  }, [messageData?.pages]);
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [messages.length]);

  return (
    <ScrollArea
      type="scroll"
      scrollHideDelay={300}
      className="flex-1 overflow-y-auto"
    >
      {isFetchingNextPage && (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
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
  );
};

export default MessageList;
