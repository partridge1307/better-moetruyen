import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { FC } from 'react';
import LatestMangaCard from './LatestMangaCard';

interface LatestMangaProps {}

const LatestManga: FC<LatestMangaProps> = async ({}) => {
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
          name: true,
          image: true,
          review: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      },
      id: true,
      volume: true,
      chapterIndex: true,
      name: true,
      createdAt: true,
    },
  });

  return (
    <ul
      className={cn(
        'flex overflow-auto gap-4 p-2 snap-proximity snap-x',
        'md:max-h-[600px] lg:max-h-[800px] md:flex-col md:snap-y md:scrollbar md:dark:scrollbar--dark'
      )}
    >
      {chapters.map((chapter, idx) => (
        <li key={idx} className="snap-start">
          <LatestMangaCard chapter={chapter} />
        </li>
      ))}
    </ul>
  );
};

export default LatestManga;
