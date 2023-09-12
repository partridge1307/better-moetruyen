import { FC } from 'react';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/DropdownMenu';
import UserBanner from '../User/UserBanner';
import UserAvatar from '../User/UserAvatar';
import Username from '../User/Username';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/Button';
import { MessageCircle } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { meDomain } from '@/config';

const SignOutButton = dynamic(() => import('@/components/Auth/SignOutButton'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-10 p-2 px-4 rounded-md dark:bg-zinc-900" />
  ),
});

interface UserDropdownMenuProps {
  session: Session;
}

const UserDropdownMenu: FC<UserDropdownMenuProps> = ({ session }) => {
  return (
    <DropdownMenuContent align="end" className="w-[250px] md:w-[300px] p-2">
      <div>
        <div className="relative">
          <UserBanner user={session.user} className="rounded-md" />
          <UserAvatar
            user={session.user}
            className="w-16 h-16 lg:w-20 lg:h-20 border-4 absolute left-3 bottom-0 translate-y-1/2"
          />
        </div>

        <Username
          user={session.user}
          className="text-lg font-semibold text-start pl-3 mt-14 lg:pl-4 lg:mt-16"
        />
      </div>
      <DropdownMenuSeparator />
      <div className="space-y-2">
        <DropdownMenuItem asChild>
          <Link href="/followed-manga" className="py-2 cursor-pointer">
            Truyện đang theo dõi
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/me/followed-team" className="py-2 cursor-pointer">
            Team đang theo dõi
          </Link>
        </DropdownMenuItem>
      </div>
      <DropdownMenuSeparator className="mt-2" />

      <Link
        href="/chat"
        className={cn(buttonVariants(), 'w-full cursor-pointer')}
      >
        <MessageCircle className="w-5 h-5" />
        Trò chuyện
      </Link>

      <DropdownMenuSeparator className="mt-2" />
      <DropdownMenuItem asChild>
        <Link
          href={`${meDomain}`}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full cursor-pointer'
          )}
        >
          Quản lý
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="mt-4" />
      <SignOutButton />
    </DropdownMenuContent>
  );
};

export default UserDropdownMenu;
