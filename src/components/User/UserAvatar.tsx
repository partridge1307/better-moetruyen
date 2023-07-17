import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import type {AvatarProps} from '@radix-ui/react-avatar';
import { User2 } from 'lucide-react';
import type { User } from 'next-auth';
import Image from 'next/image';
import { FC } from 'react';

interface UserAvatarProps extends AvatarProps {
  user: Pick<User, 'image' | 'name'>;
}

const UserAvatar: FC<UserAvatarProps> = ({ user, ...props }) => {
  return (
    <Avatar {...props}>
      {user.image ? (
        <div className="relative aspect-square h-full w-full flex justify-center items-center">
          <Image
            width={0}
            height={0}
            sizes="0%"
            src={user.image}
            alt="Profile picture"
            className="rounded-full w-4/5 h-4/5"
          />
        </div>
      ) : (
        <AvatarFallback className="bg-transparent dark:hover:bg-transparent/20">
          <span className="sr-only">{user?.name}</span>
          <User2 className="h-7 w-7 text-black dark:text-white" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
