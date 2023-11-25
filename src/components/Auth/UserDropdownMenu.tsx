import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import UserAvatar from '../User/UserAvatar';
import UserBanner from '../User/UserBanner';
import Username from '../User/Username';
import { buttonVariants } from '../ui/Button';
import { DropdownMenuContent, DropdownMenuSeparator } from '../ui/DropdownMenu';

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
      <div className="relative">
        <UserBanner user={session.user} className="rounded-md" />

        <UserAvatar
          user={session.user}
          className="absolute left-4 bottom-0 translate-y-1/2 w-16 h-16 md:w-20 md:h-20 border-4 bg-background"
        />
      </div>

      <Username
        user={session.user}
        className="text-lg text-start font-semibold pl-4 mt-10 md:mt-12"
      />

      <DropdownMenuSeparator className="my-2" />

      <div className="space-y-2">
        <a
          href={`${process.env.NEXT_PUBLIC_ME_URL}/upload`}
          className={buttonVariants({ className: 'w-full cursor-pointer' })}
        >
          Đăng truyện
        </a>
        <a
          href={process.env.NEXT_PUBLIC_ME_URL}
          className={buttonVariants({
            variant: 'secondary',
            className: 'w-full cursor-pointer',
          })}
        >
          Quản lý
        </a>
      </div>

      <DropdownMenuSeparator className="my-2" />

      <SignOutButton />
    </DropdownMenuContent>
  );
};

export default UserDropdownMenu;
