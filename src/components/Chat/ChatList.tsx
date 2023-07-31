import { formatTimeToNow } from '@/lib/utils';
import { Clock, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useContext } from 'react';
import { ConversationContext } from '../Navbar/ChatSidebar';
import Username from '../User/Username';
import { Skeleton } from '../ui/Skeleton';
import UserAvatar from '../User/UserAvatar';

interface ChatListProps {}

const ChatList: FC<ChatListProps> = ({}) => {
  const conversation = useContext(ConversationContext);
  const { data: session, status } = useSession();

  if (status === 'loading')
    return (
      <div className="relative w-full flex items-center gap-2">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="relative w-full space-y-2">
          <Skeleton className="w-full h-4 roudned-full" />
          <Skeleton className="w-full h-4 rounded-full" />
        </div>
      </div>
    );

  return (
    <ul className="relative w-full max-h-full rounded-md overflow-auto flex flex-col p-2 gap-4">
      {conversation ? (
        conversation.map((con, index) => {
          const user = con.users.find((user) => user.id !== session?.user.id);

          if (user)
            return (
              <li key={index} className="relative">
                <Link
                  href={`/chat?id=${con.id}`}
                  className="w-full flex items-center gap-4 p-2 dark:bg-zinc-800 rounded-lg"
                >
                  {user.image ? (
                    <UserAvatar user={user} className="w-12 h-12" />
                  ) : null}

                  <div>
                    <Username user={user} />
                    <p className="flex items-center gap-1 max-sm:text-xs text-sm">
                      <Clock className="w-4 h-4" />
                      {formatTimeToNow(new Date(con.createdAt))}
                    </p>
                  </div>
                </Link>

                <X
                  role="button"
                  className="text-red-500 absolute top-1/2 -translate-y-1/2 right-2"
                />
              </li>
            );
        })
      ) : (
        <li className="text-center">Bạn chưa có hội thoại nào.</li>
      )}
    </ul>
  );
};

export default ChatList;
