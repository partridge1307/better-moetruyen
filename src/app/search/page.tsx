import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FC } from 'react';

const AdvancedMangaCard = dynamic(
  () => import('@/components/Manga/components/AdvancedMangaCard')
);
const MangaPaginationControll = dynamic(
  () => import('@/components/Manga/components/MangaPaginationControll'),
  { ssr: false }
);

interface pageProps {
  searchParams: {
    q: string | string[] | undefined;
    page: string | string[] | undefined;
  };
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const page = searchParams['page'] ?? '1';
  const queryParam = searchParams['q'];
  if (!queryParam)
    return (
      <section className="container max-sm:px-2 pt-20">
        <p>Đường dẫn không hợp lệ</p>
      </section>
    );

  const start = (Number(page) - 1) * 10;

  let query = (
    typeof queryParam === 'string' ? queryParam : queryParam[0]
  ).split(' ');

  const [mangas, totalMangas, users] = await db.$transaction([
    db.manga.findMany({
      where: {
        OR: query.map((q) => ({ name: { contains: q, mode: 'insensitive' } })),
        isPublished: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        image: true,
        review: true,
        createdAt: true,
        author: true,
        _count: {
          select: {
            chapter: true,
          },
        },
      },
      take: 10,
      skip: start,
    }),
    db.manga.count({
      where: {
        OR: query.map((q) => ({ name: { contains: q, mode: 'insensitive' } })),
        isPublished: true,
      },
    }),
    db.user.findMany({
      where: {
        OR: query.map((q) => ({ name: { contains: q, mode: 'insensitive' } })),
      },
      select: {
        name: true,
        image: true,
        color: true,
      },
    }),
  ]);

  return (
    <section className="container max-sm:px-2 pt-20 space-y-10 pb-8">
      <h1 className="text-lg font-semibold p-1 rounded-md dark:bg-zinc-900/70">
        Từ khóa: <span className="font-normal">{query.join(' ')}</span>
      </h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Manga</h2>
        <div className="rounded-md dark:bg-zinc-900/70">
          {!!mangas.length ? (
            mangas.map((manga, idx) => (
              <div key={idx} className="p-2">
                <AdvancedMangaCard manga={manga} />
              </div>
            ))
          ) : (
            <p>Không có kết quả</p>
          )}
        </div>
        <MangaPaginationControll total={totalMangas} route="/search" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">User</h2>
        <div className="p-2 rounded-md dark:bg-zinc-900/70">
          {!!users.length ? (
            users.map((user, idx) => (
              <Link
                key={idx}
                href={`/user/${user.name?.split(' ').join('-')}`}
                className="flex gap-4 rounded-md p-2 transition-colors hover:dark:bg-zinc-800"
              >
                <UserAvatar user={user} className="w-20 h-20 border-4" />
                <Username user={user} className="text-xl font-semibold pt-1" />
              </Link>
            ))
          ) : (
            <p>Không có kết quả</p>
          )}
        </div>
      </section>
    </section>
  );
};

export default page;
