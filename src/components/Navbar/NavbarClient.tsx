'use client';

import { cn } from '@/lib/utils';
import { useHeadroom } from '@mantine/hooks';
import { Bell, Menu, Search as SearchIcon, User2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Icons } from '../Icons';
import UserAvatar from '../User/UserAvatar';
import { buttonVariants } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';

const NavSidebar = dynamic(() => import('./NavSidebar'), {
  ssr: false,
  loading: () => <Menu aria-label="sidebar button" className="h-8 w-8" />,
});
const Search = dynamic(() => import('@/components/Search'), {
  ssr: false,
  loading: () => <SearchIcon className="w-7 h-7" aria-label="Search button" />,
});
const Notifications = dynamic(() => import('@/components/Notify'), {
  ssr: false,
  loading: () => <Bell aria-label="Notify button" className="w-7 h-7" />,
});
const UserDropdownMenu = dynamic(
  () => import('@/components/Auth/UserDropdownMenu')
);

const NavbarClient = () => {
  const { data: session } = useSession();

  const pinned = useHeadroom({ fixedAt: 120 });

  return (
    <nav
      className={cn(
        'sticky top-0 inset-x-0 p-2 z-50 transition-transform backdrop-blur dark:bg-zinc-800/70',
        {
          '-translate-y-full': !pinned,
        }
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-0 max-sm:px-1">
        <div className="flex items-center gap-4">
          <NavSidebar isLoggedIn={!!session} />

          <Link href="/" className="flex items-center gap-2">
            <Icons.logo
              aria-label="Moetruyen logo"
              className="h-6 w-6 bg-black dark:bg-white"
            />
            <span
              aria-label="Moetruyen"
              className="text-2xl font-semibold max-sm:hidden"
            >
              Moetruyen
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <Search />

          {!!session?.user && <Notifications />}

          <DropdownMenu>
            <DropdownMenuTrigger>
              {session?.user ? (
                <UserAvatar className="w-8 h-8" user={session.user} />
              ) : (
                <User2 className="h-7 w-7" aria-label="User button" />
              )}
            </DropdownMenuTrigger>

            {session?.user ? (
              <UserDropdownMenu session={session} />
            ) : (
              <DropdownMenuContent align="end" className="min-w-[200px] p-2">
                <DropdownMenuItem asChild>
                  <Link
                    href="/sign-in"
                    className={cn(buttonVariants(), 'w-full cursor-pointer')}
                  >
                    Đăng nhập
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/sign-up"
                    className={cn(buttonVariants(), 'w-full cursor-pointer')}
                  >
                    Đăng ký
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default NavbarClient;
