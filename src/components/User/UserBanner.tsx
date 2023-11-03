import { cn } from '@/lib/utils';
import type { User } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';

interface UserBannerProps {
  user: Pick<User, 'banner'>;
  className?: string;
  sizes?: string;
}

const UserBanner: FC<UserBannerProps> = ({ user, className, sizes }) => {
  return (
    <div className="relative aspect-video">
      {user.banner ? (
        <Image
          fill
          sizes={sizes ?? '30vw'}
          quality={40}
          priority
          src={user.banner}
          alt="User Banner"
          className={className}
        />
      ) : (
        <div
          className={cn(
            'absolute inset-0 top-0 left-0 rounded-md bg-primary-foreground',
            className
          )}
        />
      )}
    </div>
  );
};

export default UserBanner;
