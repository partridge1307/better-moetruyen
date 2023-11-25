import MangaImage from '@/components/Manga/components/MangaImage';
import { db } from '@/lib/db';
import { Eye } from 'lucide-react';
import Link from 'next/link';

const Weekly = async () => {
  const results = await db.view.findMany({
    where: {
      manga: {
        isPublished: true,
      },
    },
    orderBy: {
      weeklyView: {
        _count: 'desc',
      },
    },
    take: 10,
    select: {
      manga: {
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          weeklyView: true,
        },
      },
    },
  });

  return (
    <div className="space-y-3 px-1">
      {results.map((result, idx) => (
        <Link
          key={result.manga.id}
          href={`/manga/${result.manga.slug}`}
          className="grid grid-cols-[.3fr_1fr] gap-4 rounded-md group transition-colors hover:bg-background/20"
        >
          <div className="relative">
            <MangaImage sizes="15vw" manga={result.manga} />
            <div className="absolute top-0 left-0 p-1 pr-2 rounded-md rounded-br-full bg-leader">
              {idx + 1}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-lg font-semibold transition-all group-hover:text-xl">
              {result.manga.name}
            </p>
            <p className="flex items-center gap-1.5">
              {result._count.weeklyView} <Eye className="w-5 h-5" />
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Weekly;
