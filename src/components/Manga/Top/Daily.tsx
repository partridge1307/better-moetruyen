import { db } from '@/lib/db';
import Link from 'next/link';
import FirstThree from './FirstThree';

const Daily = async () => {
  const daily = await db.view.findMany({
    select: {
      _count: {
        select: {
          dailyView: true,
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
      dailyView: {
        _count: 'desc',
      },
    },
    take: 10,
  });

  let firstThreeMangas = daily.slice(0, 3).map((d) => d.manga);
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
        {daily.map((d, idx) => {
          if (idx === 0) {
            return (
              <li key={idx}>
                <Link href={`/manga/${d.manga.id}`}>
                  <dl>
                    <dt className="text-lg">
                      <span>{idx + 1}.</span>{' '}
                      <span className="text-orange-400">{d.manga.name}</span>
                    </dt>
                    <dd className="text-sm">Lượt xem: {d._count.dailyView}</dd>
                  </dl>
                </Link>
              </li>
            );
          } else {
            return (
              <li key={idx}>
                <Link href={`/manga/${d.manga.id}`}>
                  <dl className="text-lg">
                    <dt>
                      <span>{idx + 1}.</span> {d.manga.name}
                    </dt>
                    <dd className="text-sm">Lượt xem: {d._count.dailyView}</dd>
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

export default Daily;
