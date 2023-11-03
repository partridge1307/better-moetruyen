'use client';

import type { User } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';
import UserAvatar from '../User/UserAvatar';
import Username from '../User/Username';
import { SheetClose } from '../ui/Sheet';

interface UserSearchProps {
  users?: Pick<User, 'name' | 'color' | 'image'>[];
}

const UserSearch: FC<UserSearchProps> = ({ users }) => {
  return !!users?.length ? (
    <div className="grid md:grid-cols-2 gap-4">
      {users.map((user, idx) => (
        <Link key={idx} href={`/user/${user.name?.split(' ').join('-')}`}>
          <SheetClose className="group w-full text-start grid grid-cols-[.5fr_1fr] lg:grid-cols-[.2fr_1fr] gap-4 p-2 rounded-md transition-colors hover:bg-muted">
            <div className="relative aspect-square">
              <UserAvatar
                user={user}
                className="w-full h-full rounded-full transition-colors border-4 group-hover:border-primary-foreground"
              />
            </div>

            <Username
              user={user}
              className="text-start text-lg lg:text-xl font-semibold"
            />
          </SheetClose>
        </Link>
      ))}
    </div>
  ) : (
    <p>Không có kết quả</p>
  );
};

export default UserSearch;
