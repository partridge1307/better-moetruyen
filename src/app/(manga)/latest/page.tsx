import MangaCard from '@/components/Manga/components/MangaCard';
import PaginationControll from '@/components/PaginationControll';
import { db } from '@/lib/db';
import type { Metadata } from 'next';
import { FC } from 'react';

export const metadata: Metadata = {
  title: 'Mới cập nhật',
  description: 'Manga mới cập nhật | Moetruyen',
  keywords: ['Mới cập nhật', 'Manga', 'Moetruyen'],
};

interface pageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const getSearchParams = ({ searchParams }: pageProps) => {
  const pageParams = searchParams['page'] ?? '1';
  const limitParams = searchParams['limit'] ?? '20';

  const page = pageParams
    ? typeof pageParams === 'string'
      ? pageParams
      : pageParams[0]
    : '1';
  const limit = limitParams
    ? typeof limitParams === 'string'
      ? limitParams
      : limitParams[0]
    : '10';

  return {
    page: parseInt(page),
    limit: parseInt(limit),
  };
};

const page: FC<pageProps> = async ({ searchParams }) => {
  const { page, limit } = getSearchParams({ searchParams });

  const [latestManga, totalMangas] = await db.$transaction([
    db.chapter.findMany({
      distinct: ['mangaId'],
      where: {
        isPublished: true,
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        manga: {
          select: {
            id: true,
            slug: true,
            name: true,
            image: true,
            review: true,
            chapter: {
              take: 3,
              orderBy: {
                createdAt: 'desc',
              },
              select: {
                id: true,
                volume: true,
                chapterIndex: true,
                name: true,
                createdAt: true,
              },
            },
          },
        },
      },
    }),
    db.manga.count({
      where: { isPublished: true },
    }),
  ]);

  return (
    <main className="container max-sm:px-2 space-y-4 mt-6 p-3 rounded-md bg-gradient-to-b from-background/50">
      <h1 className="text-2xl font-semibold">Mới cập nhật</h1>
      <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {latestManga.length ? (
          latestManga.map(({ manga }, idx) => (
            <li key={idx}>
              <MangaCard manga={manga} />
            </li>
          ))
        ) : (
          <li>Không có Manga</li>
        )}
      </ul>

      <PaginationControll total={totalMangas} route="/latest?" />
    </main>
  );
};

export default page;
