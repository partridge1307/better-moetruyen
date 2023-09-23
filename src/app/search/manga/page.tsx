import { db } from '@/lib/db';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import AdvancedMangaCard from '@/components/Manga/components/AdvancedMangaCard';

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

  let query = (
    typeof queryParam === 'string' ? queryParam : queryParam[0]
  ).split(' ');

  const [mangas, total] = await db.$transaction([
    db.manga.findMany({
      where: {
        OR: query.map((q) => ({ name: { contains: q, mode: 'insensitive' } })),
        isPublished: true,
      },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
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
    }),
    db.manga.count({ where: { isPublished: true } }),
  ]);

  return (
    <main className="container mx-auto max-sm:px-2 space-y-10 mb-10">
      <h1 className="text-lg font-semibold p-1 rounded-md dark:bg-zinc-900/60">
        <span>Từ khóa:</span> {queryParam}
      </h1>

      {!!mangas.length ? (
        <div className="rounded-md p-2 space-y-6 dark:bg-zinc-900/60">
          {mangas.map((manga, idx) => (
            <AdvancedMangaCard key={idx} manga={manga} />
          ))}
        </div>
      ) : (
        <p>Không tìm thấy Forum</p>
      )}

      <PaginationControll
        total={total}
        route={`/search/manga?q=${queryParam}`}
      />
    </main>
  );
};

export default page;
