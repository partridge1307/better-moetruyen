import { cn } from '@/lib/utils';
import type { User } from '@prisma/client';
import { FC, HTMLAttributes } from 'react';

interface UsernameProps extends HTMLAttributes<HTMLHeadElement> {
  user: Pick<User, 'color' | 'name'>;
  className?: string;
}

const Username: FC<UsernameProps> = ({ user, className }) => {
  return (
    <h6
      className={cn(
        'text-center font-medium bg-clip-text text-transparent animate-rainbow',
        !user.color && 'text-white',
        className
      )}
      style={{
        backgroundImage: user.color
          ? // @ts-ignore
            user.color.from || user.color.to
            ? // @ts-ignore
              `linear-gradient(to right, ${user.color.from}, ${user.color.to})`
            : ''
          : '',
        backgroundColor: user.color
          ? // @ts-ignore
            user.color.color
            ? // @ts-ignore
              user.color.color
            : ''
          : '',
      }}
    >
      {user.name}
    </h6>
  );
};

export default Username;
