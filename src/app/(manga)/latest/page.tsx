import LatestMangaCard from '@/components/Manga/LatestMangaCard';
import LatestMangaControll from '@/components/Manga/LatestMangaControll';
import { db } from '@/lib/db';
import { FC } from 'react';

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

  const [latestManga, mangaCount] = await Promise.all([
    db.chapter.findMany({
      distinct: ['mangaId'],
      where: {
        isPublished: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: start,
      take: end,
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
    db.manga.count(),
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

        <LatestMangaControll
          count={mangaCount}
          hasPrevPage={start > 0}
          hasNextPage={end < mangaCount}
        />
      </div>
    </section>
  );
};

export default page;
