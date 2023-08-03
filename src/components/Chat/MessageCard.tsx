import { cn, formatTimeToNow } from '@/lib/utils';
import type { Message } from '@prisma/client';
import { FC } from 'react';

interface MessageCardProps {
  message: Pick<Message, 'content' | 'createdAt'>;
  className: string;
}

const MessageCard: FC<MessageCardProps> = ({ message, className }) => {
  return (
    <div className={cn('relative w-full flex flex-col gap-1', className)}>
      <p className="text-xs">{formatTimeToNow(new Date(message.createdAt))}</p>
      <p className="w-fit max-w-[50%] rounded-full rounded-br-none p-2 px-4 dark:bg-zinc-800">
        {message.content}
      </p>
    </div>
  );
};

export default MessageCard;
