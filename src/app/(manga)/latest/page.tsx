import LatestMangaCard from '@/components/Manga/LatestMangaCard';
import MangaPaginationControll from '@/components/Manga/MangaPaginationControll';
import { db } from '@/lib/db';
import type { Metadata } from 'next';
import { FC } from 'react';

export const metadata: Metadata = {
  title: 'Mới cập nhật',
  description: 'Manga mới cập nhật | Moetruyen',
  keywords: ['Mới cập nhật', 'Manga', 'Moetruyen'],
  openGraph: {
    siteName: 'Moetruyen',
    title: 'Mới cập nhật',
    description: 'Mới cập nhật | Moetruyen',
  },
  twitter: {
    site: 'Moetruyen',
    title: 'Mới cập nhật',
    description: 'Mới cập nhật | Moetruyen',
  },
};

interface pageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const page = searchParams['page'] ?? '1';
  const perPage = searchParams['per-page'] ?? '10';
  const start = (Number(page) - 1) * Number(perPage);
  const end = start + Number(perPage);

  const [latestManga, mangaCount] = await db.$transaction([
    db.chapter.findMany({
      distinct: ['mangaId'],
      where: {
        isPublished: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: start,
      take: Number(perPage),
      select: {
        manga: {
          select: {
            id: true,
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
      where: { isPublished: true },
    }),
  ]);

  return (
    <section className="container mx-auto max-sm:px-2 h-screen pt-20">
      <div className="space-y-8">
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 gap-y-6 p-2 dark:bg-zinc-700 rounded-lg">
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

        <MangaPaginationControll
          count={mangaCount}
          hasPrevPage={start > 0}
          hasNextPage={end < mangaCount}
        />
      </div>
    </section>
  );
};

export default page;
