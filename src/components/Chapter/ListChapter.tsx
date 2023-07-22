import { db } from '@/lib/db';
import { formatTimeToNow } from '@/lib/utils';
import parseJSON from 'date-fns/parseJSON';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import { ScrollArea } from '../ui/ScrollArea';
import dynamic from 'next/dynamic';
const ChapterTeam = dynamic(() => import('./ChapterTeam'), { ssr: false });

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
      <ScrollArea>
        {chapters.map((chapter, idx) => (
          <div key={idx}>
            <Link
              href={`/chapter/${chapter.id}`}
              className="flex items-center justify-between rounded-lg bg-zinc-800 p-2 py-5 max-sm:flex-wrap max-sm:gap-2"
            >
              <div className="flex gap-2">
                <p>Vol. {chapter.volume}</p>
                <p>Ch. {chapter.chapterIndex}</p>
                <p>-</p>
                {chapter.name !== null && (
                  <p
                    title={`Chapter ${chapter.name}`}
                    className="line-clamp-2 capitalize md:line-clamp-3"
                  >
                    {chapter.name}
                  </p>
                )}
              </div>

              <div className="flex max-sm:flex-col max-sm:items-start items-center gap-2 md:gap-4">
                <ChapterTeam teamId={chapter.teamId} team={chapter.team} />
                <dl className="flex items-center gap-1">
                  <dt>
                    <Clock className="h-4 w-4" />
                  </dt>
                  <dd>{formatTimeToNow(parseJSON(chapter.createdAt))}</dd>
                </dl>
              </div>
            </Link>
          </div>
        ))}
      </ScrollArea>
    )
  );
};

export default ListChapter;
