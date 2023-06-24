import { AvatarProps } from '@radix-ui/react-avatar';
import { User } from 'next-auth';
import { FC } from 'react';
import { Avatar, AvatarFallback } from './ui/Avatar';
import { Icons } from './Icons';
import Image from 'next/image';

interface UserAvatarProps extends AvatarProps {
  user: Pick<User, 'image' | 'name'>;
}

const UserAvatar: FC<UserAvatarProps> = ({ user, ...props }) => {
  return (
    <Avatar {...props}>
      {user.image ? (
        <div className="relative aspect-square h-full w-full">
          <Image fill src={user.image} alt="Profile picture" />
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user?.name}</span>
          <Icons.user className="h-4 w-4 text-black" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
