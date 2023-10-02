import { db } from '@/lib/db';
import type { Team } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';
import { TabsContent } from '../ui/Tabs';
import Link from 'next/link';
import { formatTimeToNow } from '@/lib/utils';

interface ChapterProps {
  team: Pick<Team, 'id'>;
}

const Chapter: FC<ChapterProps> = async ({ team }) => {
  const mangas = await db.manga.findMany({
    where: {
      chapter: {
        some: {
          teamId: team.id,
        },
      },
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      image: true,
      name: true,
      chapter: {
        where: {
          isPublished: true,
        },
        select: {
          id: true,
          volume: true,
          chapterIndex: true,
          name: true,
          createdAt: true,
        },
      },
    },
  });

  return (
    <TabsContent
      value="chapter"
      className="p-2 space-y-7 rounded-md dark:bg-zinc-900/60"
    >
      {mangas.map((manga) => (
        <div
          key={manga.id}
          className="grid md:grid-cols-[.3fr_1fr] gap-6 rounded-md max-sm:p-2 bg-background"
        >
          <Link
            href={`/manga/${manga.slug}`}
            className="relative"
            style={{ aspectRatio: 4 / 3 }}
          >
            <Image
              fill
              sizes="(max-width: 640px) 30vw, 20vw"
              quality={40}
              src={manga.image}
              alt={`${manga.name} Thumbnail`}
              className="object-cover"
            />
          </Link>

          <div className="flex flex-col gap-3">
            <Link
              href={`/manga/${manga.slug}`}
              className="text-xl font-semibold"
            >
              {manga.name}
            </Link>

            <div className="max-h-60 md:max-h-36 lg:max-h-44 space-y-2.5 md:space-y-2 overflow-y-auto scrollbar dark:scrollbar--dark">
              {manga.chapter.map((chapter) => (
                <Link
                  key={chapter.id}
                  scroll={false}
                  href={`/chapter/${chapter.id}`}
                  className="md:max-w-[calc(100%-5px)] flex justify-between items-center p-2 lg:p-2.5 rounded-md dark:bg-zinc-800"
                >
                  <div className="flex items-center gap-2">
                    <p className="shrink-0 flex items-center gap-1.5">
                      <span>Vol. {chapter.volume}</span>
                      <span>Ch. {chapter.chapterIndex}</span>
                    </p>
                    {!!chapter.name && (
                      <>
                        <span>-</span>{' '}
                        <p className="line-clamp-1">
                          {chapter.name} djoawd pawd awdpla dwpald
                        </p>
                      </>
                    )}
                  </div>

                  <time
                    className="shrink-0"
                    dateTime={chapter.createdAt.toDateString()}
                  >
                    {formatTimeToNow(new Date(chapter.createdAt))}
                  </time>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
    </TabsContent>
  );
};

export default Chapter;
