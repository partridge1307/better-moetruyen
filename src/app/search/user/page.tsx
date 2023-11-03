import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { countFTResult, searchUser } from '@/lib/query';
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
    countFTResult(query, 'User'),
  ]);

  return (
    <main className="container max-sm:px-2 space-y-4 mt-10">
      <h1 className="text-xl">Từ khóa: {query}</h1>

      {users.length ? (
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 rounded-md bg-gradient-to-b from-background/40">
          {users.map((user, idx) => (
            <li key={idx}>
              <Link
                href={`/user/${user.name.split(' ').join('-')}`}
                className="grid grid-cols-[.3fr_1fr] gap-4 p-2 rounded-md group transition-colors hover:bg-primary-foreground"
              >
                <div className="relative aspect-square">
                  <UserAvatar
                    user={user}
                    className="w-full h-full bg-background border-4 border-muted"
                  />
                </div>
                <Username
                  user={user}
                  className="text-start text-xl lg:text-2xl font-semibold"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có kết quả</p>
      )}

      <PaginationControll
        total={total[0].count}
        route={`/search/user?q=${queryParam}`}
      />
    </main>
  );
};

export default page;
