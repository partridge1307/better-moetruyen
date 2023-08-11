'use client';

import { cn } from '@/lib/utils';
import { MessageCircle, User2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useRef } from 'react';
import SignOutButton from '../Auth/SignOutButton';
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
import NavSidebar from './NavSidebar';
import dynamic from 'next/dynamic';
const Notifications = dynamic(() => import('@/components/Notify'), {
  ssr: false,
});

const viewChapterRegex = /^(\/chapter\/\d+$)/;

const NavbarClient = () => {
  const { data: session, status } = useSession();

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
            <Icons.logo className="h-6 w-6 bg-black dark:bg-white" />
            <p className="text-2xl font-semibold max-sm:hidden">Moetruyen</p>
          </Link>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
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
                <div className="relative w-full h-fit mb-16">
                  <UserBanner user={session.user} />

                  <div className="absolute left-2 top-2/3 translate-y-1/4 flex items-end gap-2">
                    <UserAvatar
                      user={session.user}
                      className="z-10 w-20 h-20 border-4"
                    />
                    <div className="relative max-w-[80%] max-h-10 overflow-auto md:scrollbar md:dark:scrollbar--dark">
                      <Username
                        user={session.user}
                        className="pb-4 self-end line-clamp-2"
                      />
                    </div>
                  </div>
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
            ) : status === 'loading' ? (
              <template className="h-72 w-52 rounded-md dark:bg-zinc-900 animate-pulse"></template>
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
