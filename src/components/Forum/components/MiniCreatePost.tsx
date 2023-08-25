'use client';

import { FC } from 'react';
import UserAvatar from '../../User/UserAvatar';
import type { Session } from 'next-auth';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { User2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface MiniCreatePostProps {
  session: Session | null;
}

const MiniCreatePost: FC<MiniCreatePostProps> = ({ session }) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 p-3 py-4 rounded-md dark:bg-zinc-900/40">
      <div className="flex items-center gap-4">
        {!!session ? (
          <UserAvatar user={session.user} />
        ) : (
          <User2 className="h-7 w-7 text-black dark:text-white" />
        )}
        <Input
          readOnly
          placeholder="Thêm bài viết"
          className="flex-1 dark:border-zinc-700 focus-visible:ring-transparent focus-visible:ring-offset-transparent"
          onClick={() => router.push(`${pathname}/create`)}
        />
      </div>
      <Button
        className="self-end"
        onClick={() => router.push(`${pathname}/create`)}
      >
        Đăng
      </Button>
    </div>
  );
};

export default MiniCreatePost;
