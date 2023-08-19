'use client';

import { cn } from '@/lib/utils';
import { MessageCircle, User2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useRef } from 'react';
import { Icons } from '../Icons';
import UserAvatar from '../User/UserAvatar';
import UserBanner from '../User/UserBanner';
import Username from '../User/Username';
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
  loading: () => (
    <div className="w-8 h-8 rounded-md animate-pulse dark:bg-zinc-900" />
  ),
});
const Search = dynamic(() => import('@/components/Search'), {
  ssr: false,
  loading: () => (
    <div className="w-8 h-8 rounded-md animate-pulse dark:bg-zinc-900" />
  ),
});
const Notifications = dynamic(() => import('@/components/Notify'), {
  ssr: false,
  loading: () => (
    <div className="w-8 h-8 rounded-md animate-pulse dark:bg-zinc-900" />
  ),
});
const SignOutButton = dynamic(() => import('@/components/Auth/SignOutButton'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-10 p-2 px-4 rounded-md dark:bg-zinc-900" />
  ),
});

const viewChapterRegex = /^(\/chapter\/\d+$)/;

const NavbarClient = () => {
  const { data: session } = useSession();

  const pathname = usePathname();
  const isFixed = useRef(true);
  useMemo(() => {
    if (pathname.match(viewChapterRegex)) {
      isFixed.current = false;
    } else {
      isFixed.current = true;
    }
  }, [pathname]);

  return (
    <nav
      className={cn(
        'inset-x-0 top-0 p-2 z-30 h-fit border-b bg-slate-100 dark:bg-zinc-800',
        isFixed.current && 'fixed'
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-0 max-sm:px-1">
        <div className="flex items-center gap-4">
          <NavSidebar />
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo
              aria-label="Moetruyen logo"
              className="h-6 w-6 bg-black dark:bg-white"
            />
            <p
              aria-label="Moetruyen"
              className="text-2xl font-semibold max-sm:hidden"
            >
              Moetruyen
            </p>
          </Link>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <Search />

          {!!session?.user && <Notifications session={session} />}

          <DropdownMenu>
            <DropdownMenuTrigger>
              {session?.user ? (
                <UserAvatar className="w-8 h-8" user={session.user} />
              ) : (
                <User2 className="h-7 w-7" />
              )}
            </DropdownMenuTrigger>

            {session?.user ? (
              <DropdownMenuContent
                align="end"
                className="w-[250px] md:w-[300px] p-2"
              >
                <div>
                  <div className="relative">
                    <UserBanner user={session.user} className="rounded-md" />
                    <UserAvatar
                      user={session.user}
                      className="w-20 h-20 lg:w-24 lg:h-24 border-4 absolute left-2 bottom-0 translate-y-1/2"
                    />
                  </div>

                  <Username
                    user={session.user}
                    className="text-lg font-semibold text-start pl-2 mt-14 lg:pl-4 lg:mt-16"
                  />
                </div>
                <DropdownMenuSeparator />
                <div className="space-y-2">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/me/followed-manga"
                      className="py-2 cursor-pointer"
                    >
                      Truyện đang theo dõi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/me/followed-team"
                      className="py-2 cursor-pointer"
                    >
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
                    href="/me"
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
