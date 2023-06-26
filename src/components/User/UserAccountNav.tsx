'use client';

import { User } from 'next-auth';
import { FC } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import UserAvatar from './UserAvatar';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/Button';

interface UserAccountNavProps {
  user: Pick<User, 'image' | 'name'>;
}

const UserAccountNav: FC<UserAccountNavProps> = ({ user }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          className="h-8 w-8"
          user={{ image: user.image || null, name: user.name || null }}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="mt-4 w-[200px] text-center">
        <div>
          <div>
            {user.name ? (
              <p className="font-medium">{user.name}</p>
            ) : (
              <p className="font-medium">Mòe mộng mơ</p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/me/manga-followed">Truyện theo dõi</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/me/team-followed">Team theo dõi</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/me/upload" className={cn(buttonVariants(), 'w-full')}>
            Đăng truyện
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/me/setting">Setting</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            signOut({
              callbackUrl: `${window.location.origin}/sign-in`,
            });
          }}
          className={cn(buttonVariants({ variant: 'destructive' }), 'w-full')}
        >
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
