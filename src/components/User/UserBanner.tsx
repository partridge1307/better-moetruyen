import { cn } from '@/lib/utils';
import type { User } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';

interface UserBannerProps extends React.HTMLAttributes<HTMLImageElement> {
  user: Pick<User, 'banner'>;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

const UserBanner: FC<UserBannerProps> = ({
  user,
  priority = true,
  quality = 40,
  sizes = '30vw',
  className,
  placeholder,
  ...props
}) => {
  return (
    <div className="relative aspect-[2.39/1]">
      {user.banner ? (
        <Image
          fill
          priority={priority}
          sizes={sizes}
          quality={quality}
          src={user.banner}
          alt="User Banner"
          className={className}
          {...props}
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
