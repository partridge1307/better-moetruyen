import { cn, formatTimeToNow } from '@/lib/utils';
import type { Message, User } from '@prisma/client';
import { FC } from 'react';
import UserAvatar from '../User/UserAvatar';

interface MessageCardProps {
  message: Pick<Message, 'content' | 'createdAt'>;
  isMe: boolean;
  sender: Pick<User, 'image' | 'name'>;
}

const MessageCard: FC<MessageCardProps> = ({ message, isMe, sender }) => {
  return (
    <>
      {!isMe && !!sender.image && <UserAvatar user={sender} />}
      <div
        className={cn('relative w-full flex flex-col gap-1', {
          'items-end': isMe,
          'items-start': !isMe,
        })}
      >
        <p className="text-xs">
          {formatTimeToNow(new Date(message.createdAt))}
        </p>
        <p
          className={cn(
            'w-fit max-w-[50%] rounded-full p-2 px-4 dark:bg-zinc-800',
            isMe ? 'rounded-br-none' : 'rounded-tl-none'
          )}
        >
          {message.content}
        </p>
      </div>
    </>
  );
};

export default MessageCard;
