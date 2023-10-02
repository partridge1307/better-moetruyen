import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const Weekly = async () => {
  const results = await db.view.findMany({
    orderBy: {
      weeklyView: {
        _count: 'desc',
      },
    },
    take: 10,
    select: {
      mangaId: true,
      manga: {
        select: {
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
    <div className="space-y-3 rounded-md dark:bg-zinc-900/60">
      {results.map((result, idx) => (
        <Link
          key={result.mangaId}
          href={`/manga/${result.manga.slug}`}
          className="block p-2 rounded-md transition-colors hover:dark:bg-zinc-900"
        >
          <dl
            className={cn('flex items-center gap-2', {
              'text-lg lg:text-xl dark:text-amber-500': idx === 0,
            })}
          >
            <dt>{idx + 1}.</dt>
            <dd className="line-clamp-2">{result.manga.name}</dd>
          </dl>
          <p className="text-sm">{result._count.weeklyView} lượt xem</p>
        </Link>
      ))}
    </div>
  );
};

export default Weekly;
