import { db } from '@/lib/db';
import { cn } from '@/lib/utils';

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
    <div className="space-y-3 rounded-md dark:bg-zinc-900/60">
      {results.map((result, idx) => (
        <a
          key={idx}
          target="_blank"
          href={`/team/${result.id}`}
          className="block p-2 rounded-md transition-colors hover:dark:bg-zinc-900"
        >
          <dl
            className={cn('flex items-center gap-2', {
              'text-lg lg:text-xl dark:text-amber-500': idx === 0,
            })}
          >
            <dt>{idx + 1}.</dt>
            <dd className="line-clamp-2">{result.name}</dd>
          </dl>
          <p className="text-sm">{result.totalView} lượt xem</p>
        </a>
      ))}
    </div>
  );
};

export default All;
