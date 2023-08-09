import { db } from '@/lib/db';
import FirstThree from './FirstThree';
import Link from 'next/link';

const Weekly = async () => {
  const weekly = await db.view.findMany({
    select: {
      _count: {
        select: {
          weeklyView: true,
        },
      },
      manga: {
        select: {
          id: true,
          image: true,
          name: true,
        },
      },
    },
    orderBy: {
      weeklyView: {
        _count: 'desc',
      },
    },
    take: 10,
  });

  let firstThreeMangas = weekly.slice(0, 3).map((w) => w.manga);
  if (firstThreeMangas.length === 1) {
    firstThreeMangas.push(
      ...[
        { id: -1, image: '', name: '' },
        { id: -1, image: '', name: '' },
      ]
    );
  } else if (firstThreeMangas.length === 2) {
    firstThreeMangas.push({ id: -1, image: '', name: '' });
  } else if (!firstThreeMangas.length) {
    firstThreeMangas.push(
      ...[
        { id: -1, image: '', name: '' },
        { id: -1, image: '', name: '' },
        { id: -1, image: '', name: '' },
      ]
    );
  }

  return (
    <div className="space-y-4">
      <FirstThree mangas={firstThreeMangas} />

      <ul className="p-4 space-y-6 dark:bg-zinc-900/70 rounded-lg">
        {weekly.map((w, idx) => {
          if (idx === 0) {
            return (
              <li key={idx}>
                <Link href={`/manga/${w.manga.id}`}>
                  <dl>
                    <dt className="text-lg">
                      <span>{idx + 1}.</span>{' '}
                      <span className="text-orange-400">{w.manga.name}</span>
                    </dt>
                    <dd className="text-sm">Lượt xem: {w._count.weeklyView}</dd>
                  </dl>
                </Link>
              </li>
            );
          } else {
            return (
              <li key={idx}>
                <Link href={`/manga/${w.manga.id}`}>
                  <dl className="text-lg">
                    <dt>
                      <span>{idx + 1}.</span> {w.manga.name}
                    </dt>
                    <dd className="text-sm">Lượt xem: {w._count.weeklyView}</dd>
                  </dl>
                </Link>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
};

export default Weekly;
