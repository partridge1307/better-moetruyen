import { cn } from '@/lib/utils';
import type { User } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';

interface UserBannerProps {
  user: Pick<User, 'banner'>;
  className?: string;
  ratioClassName?: string;
}

const UserBanner: FC<UserBannerProps> = ({
  user,
  ratioClassName,
  className,
}) => {
  return (
    <div className={cn(ratioClassName, 'relative aspect-video')}>
      {user.banner ? (
        <Image
          fill
          sizes="30vw"
          quality={40}
          priority
          src={user.banner}
          alt="User Banner"
          className={className}
        />
      ) : (
        <div className="absolute inset-0 top-0 left-0 rounded-md dark:bg-zinc-900" />
      )}
    </div>
  );
};

export default UserBanner;
