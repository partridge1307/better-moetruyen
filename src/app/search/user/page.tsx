import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { db } from '@/lib/db';
import { searchUser } from '@/lib/query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FC } from 'react';

const PaginationControll = dynamic(
  () => import('@/components/PaginationControll'),
  { ssr: false }
);

interface pageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const page = searchParams['page'] ?? '1';
  const limit = searchParams['limit'] ?? '10';
  const queryParam = searchParams['q'];
  if (!queryParam)
    return (
      <main className="container max-sm:px-2 mb-10">
        <p>Đường dẫn không hợp lệ</p>
      </main>
    );

  let query = typeof queryParam === 'string' ? queryParam : queryParam[0];

  const [users, total] = await Promise.all([
    searchUser({
      searchPhrase: query,
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
    }),
    db.user.count({
      where: {
        name: {
          contains: query,
        },
      },
    }),
  ]);

  return (
    <main className="container mx-auto max-sm:px-2 space-y-10 mb-10">
      <h1 className="text-lg font-semibold p-1 rounded-md dark:bg-zinc-900/60">
        <span>Từ khóa:</span> {queryParam}
      </h1>

      {!!users.length ? (
        <div className="grid grid-cols-2 gap-6 p-2 rounded-md dark:bg-zinc-900/60">
          {users.map((user, idx) => (
            <Link
              key={idx}
              href={`/user/${user.name?.split(' ').join('-')}`}
              className="flex gap-4 rounded-md p-2 transition-colors hover:dark:bg-zinc-900"
            >
              <UserAvatar
                user={user}
                className="w-20 h-20 border-4 dark:bg-zinc-900"
              />
              <Username user={user} className="text-xl font-semibold pt-1" />
            </Link>
          ))}
        </div>
      ) : (
        <p>Không tìm thấy Forum</p>
      )}

      <PaginationControll
        total={total}
        route={`/search/user?q=${queryParam}`}
      />
    </main>
  );
};

export default page;
