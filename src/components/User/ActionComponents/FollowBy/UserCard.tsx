import Link from 'next/link';
import { FC } from 'react';
import UserAvatar from '../../UserAvatar';
import UserBanner from '../../UserBanner';
import Username from '../../Username';
import type { TUser } from './FollowByInfo';

interface UserCardProps {
  user: TUser;
}

const UserCard: FC<UserCardProps> = ({ user }) => {
  return (
    <Link
      href={`/user/${user.name?.split(' ').join('-')}`}
      className="block p-2 pb-6 rounded-md transition-colors bg-primary-foreground hover:bg-primary-foreground/70"
    >
      <div className="relative">
        <UserBanner user={user} className="bg-background" />
        <UserAvatar
          user={user}
          className="absolute left-[5%] bottom-0 translate-y-1/2 w-20 h-20 border-4 border-muted bg-background"
        />
      </div>
      <Username user={user} className="text-start ml-28 mt-1 font-semibold" />
    </Link>
  );
};

export default UserCard;
