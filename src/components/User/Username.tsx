import { cn } from '@/lib/utils';
import type { User } from '@prisma/client';
import { FC, HTMLAttributes } from 'react';

interface UsernameProps extends HTMLAttributes<HTMLHeadElement> {
  user: Pick<User, 'color' | 'name'>;
  className?: string;
}

const Username: FC<UsernameProps> = ({ user, className }) => {
  return (
    <p
      className={cn(
        'text-center text-transparent font-medium bg-clip-text animate-rainbow',
        (!!!user.color || user.color === null) && 'dark:text-white',
        className
      )}
      style={{
        backgroundImage:
          !!user.color && // @ts-ignore
          !!user.color.from && // @ts-ignore
          !!user.color.to
            ? // @ts-ignore
              `linear-gradient(to right, ${user.color.from}, ${user.color.to})`
            : undefined,
        backgroundColor:
          !!user.color && // @ts-ignore
          !!user.color.color
            ? // @ts-ignore
              user.color.color
            : undefined,
      }}
    >
      {user.name}
    </p>
  );
};

export default Username;
