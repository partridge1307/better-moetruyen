'use client';

import type { User } from '@prisma/client';
import { FC } from 'react';
import UserAvatar from '../User/UserAvatar';
import Username from '../User/Username';
import Link from 'next/link';
import { DialogClose } from '@radix-ui/react-dialog';

interface UserSearchProps {
  users?: Pick<User, 'name' | 'color' | 'image'>[];
}

const UserSearch: FC<UserSearchProps> = ({ users }) => {
  return !!users?.length ? (
    <div className="space-y-7">
      {users.map((user, idx) => (
        <Link key={idx} href={`/user/${user.name?.split(' ').join('-')}`}>
          <DialogClose className="flex w-full gap-4 p-2 rounded-md text-start transition-colors duration-100 hover:dark:bg-zinc-800">
            <UserAvatar user={user} className="w-16 h-16 border-4" />
            <Username
              user={user}
              className="text-start font-medium text-lg pt-1"
            />
          </DialogClose>
        </Link>
      ))}
    </div>
  ) : (
    <p>Không có kết quả</p>
  );
};

export default UserSearch;
