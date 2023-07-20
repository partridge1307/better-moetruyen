'use client';

import { cn } from '@/lib/utils';
import type { Session } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, useMemo, useRef } from 'react';
import SignOutButton from './Auth/SignOutButton';
import { Icons } from './Icons';
import NavSidebar from './NavSidebar';
import UserAvatar from './User/UserAvatar';
import { buttonVariants } from './ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import Image from 'next/image';
import { User2 } from 'lucide-react';

interface NavbarClientProps {
  session?: Session | null;
}

const viewChapterRegex = /^(\/chapter\/\d+$)/;

const NavbarClient: FC<NavbarClientProps> = ({ session }) => {
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
    <div
      className={cn(
        'inset-x-0 top-0 z-30 h-fit border-b bg-slate-100 dark:bg-zinc-800',
        isFixed.current && 'fixed'
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-0 max-sm:px-4">
        <div className="flex items-center gap-4">
          <NavSidebar />
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-6 w-6 bg-black dark:bg-white" />
            <p className="text-2xl font-semibold max-sm:hidden">Moetruyen</p>
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            {session?.user ? (
              <UserAvatar className="w-8 h-8" user={session.user} />
            ) : (
              <User2 className="h-7 w-7" />
            )}
          </DropdownMenuTrigger>

          {session?.user ? (
            <DropdownMenuContent align="end" className="min-w-[300px] p-2">
              <div className="relative w-full h-fit space-y-3 mb-6">
                <div>
                  {session.user.image && (
                    <div
                      className={cn(
                        'z-10 left-2 top-1/2',
                        session.user.banner
                          ? 'absolute border-[6px] rounded-full'
                          : 'flex justify-center'
                      )}
                    >
                      <div className="relative w-20 h-20">
                        <Image
                          fill
                          src={session.user.image}
                          alt="User Avatar"
                          className="rounded-full"
                        />
                      </div>
                    </div>
                  )}
                  {session.user.banner && (
                    <div className="relative w-full h-32">
                      <Image
                        fill
                        src={session.user.banner}
                        alt="User Banner"
                        className="rounded-md"
                      />
                    </div>
                  )}
                </div>

                <p
                  className={cn(
                    'text-center text-lg font-medium text-white',
                    session.user.image && session.user.banner && 'ml-5'
                  )}
                  style={{
                    color: session.user.color ? session.user.color : '',
                  }}
                >
                  {session.user.name}
                </p>
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
                  className={cn(buttonVariants(), 'w-full')}
                >
                  Đăng nhập
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/sign-up"
                  className={cn(buttonVariants(), 'w-full')}
                >
                  Đăng ký
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
    </div>
  );
};

export default NavbarClient;
