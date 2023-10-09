import { db } from '@/lib/db';
import LastestMangaCard from './components/LastestMangaCard';

const LatestManga = async () => {
  const chapters = await db.chapter.findMany({
    take: 10,
    distinct: ['mangaId'],
    where: {
      isPublished: true,
    },
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
        },
      },
      volume: true,
      chapterIndex: true,
      name: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-3 rounded-md dark:bg-zinc-900/60">
      {chapters.map((chapter) => (
        <LastestMangaCard key={chapter.manga.id} chapter={chapter} />
      ))}
    </div>
  );
};

export default LatestManga;
