import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const All = async () => {
  const results = await db.team.findMany({
    orderBy: {
      totalView: 'desc',
    },
    take: 10,
    select: {
      id: true,
      name: true,
      totalView: true,
    },
  });

  return (
    <div className="space-y-3 px-1">
      {results.map((result, idx) => (
        <Link
          key={idx}
          href={`/team/${result.id}`}
          className="block p-2 rounded-md transition-colors hover:bg-background/20"
        >
          <dl
            className={cn('flex items-center gap-2', {
              'text-lg lg:text-xl text-red-600': idx === 0,
            })}
          >
            <dt>{idx + 1}.</dt>
            <dd className="line-clamp-2">{result.name}</dd>
          </dl>
          <p className="text-sm">{result.totalView} lượt xem</p>
        </Link>
      ))}
    </div>
  );
};

export default All;
