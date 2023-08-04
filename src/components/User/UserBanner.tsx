import type { User } from '@prisma/client';
import { FC } from 'react';
import { AspectRatio } from '../ui/AspectRatio';
import Image from 'next/image';

interface UserBannerProps {
  user: Pick<User, 'banner'>;
  className?: string;
}

const UserBanner: FC<UserBannerProps> = ({ user, className }) => {
  return (
    <AspectRatio ratio={16 / 9}>
      {user.banner !== null ? (
        <Image
          fill
          sizes="0%"
          priority
          src={user.banner}
          alt="User Banner"
          className={className}
        />
      ) : (
        <div className="absolute inset-0 top-0 left-0 dark:bg-zinc-900" />
      )}
    </AspectRatio>
  );
};

export default UserBanner;
