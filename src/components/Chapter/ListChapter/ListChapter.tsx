import { db } from '@/lib/db';
import { formatTimeToNow } from '@/lib/utils';
import parseJSON from 'date-fns/parseJSON';
import { Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface ListChapterProps {
  mangaId: number;
}

const ListChapter: FC<ListChapterProps> = async ({ mangaId }) => {
  const chapters = await db.manga
    .findUnique({
      where: {
        id: mangaId,
      },
    })
    .chapter({
      select: {
        id: true,
        name: true,
        chapterIndex: true,
        isPublished: true,
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
    chapters?.length && (
      <ul className="space-y-4">
        {chapters
          .sort((a, b) => b.chapterIndex - a.chapterIndex)
          .map((chapter, idx) => {
            if (chapter.isPublished) {
              return (
                <li
                  key={idx}
                  className="dark:bg-zinc-800 px-3 py-2 md:py-3 rounded-lg space-y-1 md:space-y-2"
                >
                  <Link
                    href={`/chapter/${chapter.id}`}
                    className="flex items-center justify-between max-sm:flex-col max-sm:items-start"
                  >
                    <div className="flex items-center gap-1 max-sm:text-sm">
                      <p>Vol. {chapter.volume}</p>
                      <p>Ch. {chapter.chapterIndex}</p>
                      {chapter.name && (
                        <>
                          <p>-</p>
                          <p
                            title={`Chapter ${chapter.name}`}
                            className="line-clamp-2 capitalize md:line-clamp-3"
                          >
                            {chapter.name}
                          </p>
                        </>
                      )}
                    </div>

                    <dl className="flex items-center gap-1 max-sm:text-sm">
                      <dt>
                        <Clock className="h-4 w-4" />
                      </dt>
                      <dd>{formatTimeToNow(parseJSON(chapter.createdAt))}</dd>
                    </dl>
                  </Link>

                  {chapter.team && (
                    <Link
                      href={`/team/${chapter.teamId}`}
                      className="flex items-center gap-1"
                    >
                      {chapter.team.image && (
                        <div className="relative h-5 w-5 md:h-6 md:w-6">
                          <Image
                            fill
                            sizes="0%"
                            src={chapter.team.image}
                            alt="Team Image"
                            className="rounded-full"
                          />
                        </div>
                      )}

                      <p className="text-sm md:text-base font-medium">
                        {chapter.team.name}
                      </p>
                    </Link>
                  )}
                </li>
              );
            }
          })}
      </ul>
    )
  );
};

export default ListChapter;
