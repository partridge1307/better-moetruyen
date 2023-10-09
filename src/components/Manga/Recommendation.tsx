import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { randomManga } from '@/lib/query';
import { formatTimeToNow, groupArray } from '@/lib/utils';
import type { Session } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';

const getMangas = async (session: Session | null) => {
  if (session) {
    const [mangaHistory, mangaCount] = await db.$transaction([
      db.history.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          manga: {
            select: {
              tags: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 10,
      }),
      db.manga.count({ where: { isPublished: true } }),
    ]);

    if (mangaHistory.length) {
      const tags = mangaHistory.flatMap((h) =>
        h.manga.tags.map((tag) => tag.name)
      );

      const groupedTags = (
        Object.entries(groupArray(tags)) as [string, number][]
      ).sort((a, b) => b[1] - a[1]);

      const filterdTags = groupedTags.slice(0, 3).map((tag) => tag[0]);

      const skip = Math.floor(Math.random() * mangaCount);

      return await db.manga.findMany({
        where: {
          isPublished: true,
          OR: filterdTags.map((tag) => ({ tags: { some: { name: tag } } })),
        },
        select: {
          id: true,
          slug: true,
          image: true,
          name: true,
          createdAt: true,
        },
        take: 10,
        skip,
      });
    }
  }

  return await randomManga(10);
};

const Recommendation = async () => {
  const session = await getAuthSession();
  const mangas = await getMangas(session);

  return (
    <div className="max-sm:flex max-sm:items-center max-sm:snap-x max-sm:snap-mandatory lg:grid lg:grid-cols-2 gap-6 overflow-auto rounded-md dark:bg-zinc-900/60">
      {mangas.map((manga) => (
        <Link
          key={manga.id}
          scroll={false}
          href={`/manga/${manga.slug}`}
          className="max-sm:shrink-0 max-sm:snap-end max-sm:snap-always grid grid-cols-2 lg:grid-cols-[.5fr_1fr] gap-4 p-2 rounded-md transition-colors hover:dark:bg-zinc-900"
        >
          <div
            className="relative max-sm:min-w-[8rem]"
            style={{ aspectRatio: 4 / 3 }}
          >
            <Image
              fill
              sizes="(max-width: 640px) 25vw, 30vw"
              quality={40}
              src={manga.image}
              alt={`${manga.name} Thumbnail`}
              className="object-cover rounded-md"
            />
          </div>

          <div>
            <h1 className="text-lg lg:text-xl font-semibold line-clamp-2">
              {manga.name}
            </h1>

            <time dateTime={manga.createdAt.toDateString()} className="text-sm">
              {formatTimeToNow(new Date(manga.createdAt))}
            </time>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Recommendation;
