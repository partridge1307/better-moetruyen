import { FC } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/Accordion';
import { formatTimeToNow, groupBy } from '@/lib/utils';
import Link from 'next/link';
import { db } from '@/lib/db';
import type { Chapter } from '@prisma/client';
import { Clock } from 'lucide-react';

interface ChapterListProps {
  mangaId: string;
}

const ChapterList: FC<ChapterListProps> = async ({ mangaId }) => {
  const chapter = await db.chapter.findMany({
    where: {
      mangaId: +mangaId,
    },
    select: {
      volume: true,
      name: true,
      chapterIndex: true,
      id: true,
      createdAt: true,
    },
  });

  return (
    <Accordion type="multiple">
      {Object.entries(
        groupBy(
          chapter,
          (
            chapter: Pick<
              Chapter,
              'volume' | 'id' | 'chapterIndex' | 'name' | 'createdAt'
            >
          ) => chapter.volume
        )
      ).map(([key, value]) => (
        <AccordionItem key={key} value={key}>
          <AccordionTrigger className="hover:no-underline">
            Volume {key}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-4">
              {value
                .sort((a, b) => b.chapterIndex - a.chapterIndex)
                .map((v) => (
                  <li key={v.id}>
                    <Link
                      href={`/chapter/${v.id}`}
                      className="flex max-sm:flex-wrap max-sm:gap-2 justify-between items-center rounded-lg p-2 py-5 bg-zinc-800"
                    >
                      <div className="flex gap-2">
                        <p>Chap. {v.chapterIndex}</p>
                        <p>-</p>
                        <p
                          title={v.name ? v.name : `Chapter ${v.chapterIndex}`}
                          className="capitalize line-clamp-2 md:line-clamp-3"
                        >
                          {v.name}
                        </p>
                      </div>

                      <dl className="flex items-center gap-2">
                        <dt>
                          <Clock className="h-4 w-4" />
                        </dt>
                        <dd>{formatTimeToNow(v.createdAt)}</dd>
                      </dl>
                    </Link>
                  </li>
                ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ChapterList;
