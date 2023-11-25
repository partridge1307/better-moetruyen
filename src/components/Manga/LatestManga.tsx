import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import MangaCard from './components/MangaCard';

const LatestManga = async () => {
  const chapters = await db.chapter.findMany({
    distinct: ['mangaId'],
    where: {
      manga: {
        isPublished: true,
      },
    },
    take: INFINITE_SCROLL_PAGINATION_RESULTS,
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
            where: {
              isPublished: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 3,
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
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-y-8">
      {chapters.map(({ manga }) => (
        <MangaCard key={manga.id} manga={manga} />
      ))}
    </div>
  );
};

export default LatestManga;
