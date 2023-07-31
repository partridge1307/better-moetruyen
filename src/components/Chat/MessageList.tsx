'use client';

import { formatTimeToNow } from '@/lib/utils';
import type { Conversation, Message, User } from '@prisma/client';
import { FC } from 'react';
import UserAvatar from '../User/UserAvatar';
import ChatForm from './ChatForm';

type ExtendedConversation = Pick<Conversation, 'id'> & {
  users: Pick<User, 'id' | 'name' | 'color'>[];
  messages: (Pick<Message, 'id' | 'content' | 'createdAt'> & {
    sender: Pick<User, 'id' | 'name' | 'color' | 'image'>;
  })[];
};

interface MessageListProps {
  conversation: ExtendedConversation;
  me: Pick<User, 'id'>;
}

const MessageList: FC<MessageListProps> = ({ conversation, me }) => {
  return (
    <div className="relative h-full flex flex-col pb-2">
      <ul className="flex flex-col gap-2 h-full overflow-auto p-2">
        {conversation.messages.map((message, index) => {
          const sender = message.sender;

          if (sender.id === me.id) {
            return (
              <li key={index} className="flex gap-2 self-end">
                <div className="flex flex-col items-end gap-1">
                  <p className="p-1 px-3 rounded-full rounded-br-none dark:bg-zinc-800 w-fit">
                    {message.content}
                  </p>

                  <p className="text-xs">
                    {formatTimeToNow(new Date(message.createdAt))}
                  </p>
                </div>
              </li>
            );
          } else {
            return (
              <li key={index} className="flex gap-3">
                {sender.image ? <UserAvatar user={sender} /> : null}

                <div className="flex flex-col items-start gap-1 mt-2">
                  <p className="p-1 px-3 rounded-full rounded-tl-none dark:bg-zinc-800 w-fit">
                    {message.content}
                  </p>

                  <p className="text-xs">
                    {formatTimeToNow(new Date(message.createdAt))}
                  </p>
                </div>
              </li>
            );
          }
        })}
      </ul>

      <ChatForm conversation={conversation} />
    </div>
  );
};

export default MessageList;
