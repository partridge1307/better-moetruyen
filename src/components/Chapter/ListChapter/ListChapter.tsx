import { db } from '@/lib/db';
import { cn, formatTimeToNow } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface ListChapterProps {
  mangaId: number;
}

const ListChapter: FC<ListChapterProps> = async ({ mangaId }) => {
  const chapters = await db.chapter.findMany({
    where: {
      mangaId,
      isPublished: true,
    },
    orderBy: {
      chapterIndex: 'desc',
    },
    select: {
      id: true,
      name: true,
      chapterIndex: true,
      createdAt: true,
      teamId: true,
      volume: true,
      team: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return (
    !!chapters?.length && (
      <ul className="px-2 lg:space-y-4 divide-y dark:divide-zinc-700">
        {chapters.map((chapter) => (
          <li
            key={chapter.id}
            className={
              !!chapter.teamId && !!chapter.team
                ? 'flex flex-wrap items-center lg:gap-3 max-sm:py-4'
                : undefined
            }
          >
            <Link
              scroll={false}
              href={`/chapter/${chapter.id}`}
              className={cn(
                'relative block p-2',
                !!chapter.teamId &&
                  !!chapter.team &&
                  "flex-1 pl-4 after:content-[''] after:absolute after:inset-0 after:-z-10 after:-skew-x-12 after:transition-colors after:dark:bg-zinc-700/90 after:hover:dark:bg-zinc-700/60",
                !!!chapter.teamId &&
                  !!!chapter.team &&
                  'rounded-md hover:transition-colors dark:bg-zinc-800/90 hover:dark:bg-zinc-800/70'
              )}
            >
              <div className="flex items-center gap-1">
                <p>
                  <span>Vol. {chapter.volume}</span>{' '}
                  <span>Ch. {chapter.chapterIndex}</span>
                </p>
                {!!chapter.name && <p>- {chapter.name}</p>}
              </div>
              <time
                dateTime={chapter.createdAt.toDateString()}
                className="text-sm"
              >
                {formatTimeToNow(new Date(chapter.createdAt))}
              </time>
            </Link>

            {!!chapter.teamId && !!chapter.team && (
              <Link
                href={`/team/${chapter.teamId}`}
                className="max-sm:hidden relative flex items-center gap-3 p-2 pr-4 after:content-[''] after:absolute after:inset-0 after:-z-10 after:-skew-x-12 after:transition-colors after:dark:bg-zinc-700/90 after:hover:dark:bg-zinc-700/60"
              >
                <div className="relative aspect-square w-12 h-12">
                  <Image
                    fill
                    sizes="(max-width: 640px) 5vw, 15vw"
                    quality={40}
                    src={chapter.team.image}
                    alt={`${chapter.team.name} Thumbnail`}
                    className="rounded-full object-cover"
                  />
                </div>
                <p className="max-w-[10rem] line-clamp-1">
                  {chapter.team.name}
                </p>
              </Link>
            )}
          </li>
        ))}
      </ul>
    )
  );
};

export default ListChapter;
