import { db } from '@/lib/db';
import FirstThree from './FirstThree';
import Link from 'next/link';

const AllTime = async () => {
  const allTime = await db.view.findMany({
    take: 10,
    select: {
      totalView: true,
      manga: {
        select: {
          id: true,
          image: true,
          name: true,
        },
      },
    },
    orderBy: {
      totalView: 'desc',
    },
  });

  let firstThreeMangas = allTime.slice(0, 3).map((all) => all.manga);
  if (firstThreeMangas.length === 1) {
    firstThreeMangas.push(
      ...[
        { id: -1, image: '', name: '' },
        { id: -1, image: '', name: '' },
      ]
    );
  } else if (firstThreeMangas.length === 2) {
    firstThreeMangas.push({ id: -1, image: '', name: '' });
  }

  return (
    <div className="space-y-4">
      <FirstThree mangas={firstThreeMangas} />

      <ul className="p-4 space-y-6 dark:bg-zinc-900/70 rounded-lg">
        {allTime.map((all, idx) => {
          if (idx === 0) {
            return (
              <li key={idx}>
                <Link href={`/manga/${all.manga.id}`}>
                  <dl>
                    <dt className="text-lg">
                      <span>{idx + 1}.</span>{' '}
                      <span className="text-orange-400">{all.manga.name}</span>
                    </dt>
                    <dd className="text-sm">Lượt xem: {all.totalView}</dd>
                  </dl>
                </Link>
              </li>
            );
          } else {
            return (
              <li key={idx}>
                <Link href={`/manga/${all.manga.id}`}>
                  <dl className="text-lg">
                    <dt>
                      <span>{idx + 1}.</span> {all.manga.name}
                    </dt>
                    <dd className="text-sm">Lượt xem: {all.totalView}</dd>
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

export default AllTime;
