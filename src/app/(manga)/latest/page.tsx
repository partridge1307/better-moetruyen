import LatestMangaCard from '@/components/Manga/components/LastestMangaCard';
import MangaPaginationControll from '@/components/Manga/components/MangaPaginationControll';
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
  const limitParams = searchParams['limit'] ?? '10';

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
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        manga: {
          select: {
            slug: true,
            image: true,
            name: true,
            review: true,
            author: {
              select: {
                name: true,
              },
            },
          },
        },
        chapterIndex: true,
        volume: true,
        name: true,
        createdAt: true,
      },
    }),
    db.manga.count({
      where: { isPublished: true, chapter: { some: { isPublished: true } } },
    }),
  ]);

  return (
    <main className="container mx-auto max-sm:px-2 h-screen pt-20 space-y-10">
      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-2 rounded-md">
        {latestManga.length ? (
          latestManga.map((data, idx) => (
            <li key={idx}>
              <LatestMangaCard chapter={data} />
            </li>
          ))
        ) : (
          <li>Không có Manga</li>
        )}
      </ul>

      <MangaPaginationControll total={totalMangas} route="/latest?" />
    </main>
  );
};

export default page;
