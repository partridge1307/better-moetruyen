"use client";

import { cn } from "@/lib/utils";
import type { Session } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, useMemo, useRef } from "react";
import SignOutButton from "./Auth/SignOutButton";
import { Icons } from "./Icons";
import NavSidebar from "./NavSidebar";
import UserAvatar from "./User/UserAvatar";
import { buttonVariants } from "./ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/DropdownMenu";

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
        "inset-x-0 top-0 z-10 h-fit border-b bg-slate-100 dark:bg-zinc-800",
        isFixed.current && "fixed"
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
              <UserAvatar user={session.user} />
            ) : (
              <Icons.user className="h-7 w-7" />
            )}
          </DropdownMenuTrigger>

          {session?.user ? (
            <DropdownMenuContent align="end" className="min-w-[300px] p-2">
              <p className="text-center font-medium">{session.user.name}</p>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/me/followed-manga">Truyện đang theo dõi</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/me/followed-team">Team đang theo dõi</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/me/manga"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full"
                  )}
                >
                  Quản lý truyện
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <SignOutButton />
            </DropdownMenuContent>
          ) : (
            <DropdownMenuContent align="end" className="min-w-[200px] p-2">
              <DropdownMenuItem asChild>
                <Link
                  href="/sign-in"
                  className={cn(buttonVariants(), "w-full")}
                >
                  Đăng nhập
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/sign-up"
                  className={cn(buttonVariants(), "w-full")}
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
