import { mangaChapterGroupByVolume } from '@/lib/query';
import { formatTimeToNow } from '@/lib/utils';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/Accordion';
import parseJSON from 'date-fns/parseJSON';

interface ChapterListProps {
  mangaId: number;
}

const ChapterList: FC<ChapterListProps> = async ({ mangaId }) => {
  const chapters = await mangaChapterGroupByVolume(mangaId);

  return (
    <Accordion type="multiple">
      {chapters.map((c, idx) => (
        <AccordionItem key={`${idx}`} value={`${c.volume}`}>
          <AccordionTrigger className="hover:no-underline">
            Volume {c.volume}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-4">
              {c.data
                .sort((a, b) => b.index - a.index)
                .map((d, i) => {
                  if (d.isPublished) {
                    return (
                      <li key={`${i}`}>
                        <Link
                          href={`/chapter/${d.id}`}
                          className="flex items-center justify-between rounded-lg bg-zinc-800 p-2 py-5 max-sm:flex-wrap max-sm:gap-2"
                        >
                          <div className="flex gap-2">
                            <p>Chap. {d.index}</p>
                            <p>-</p>
                            <p
                              title={d.name ? d.name : `Chapter ${d.index}`}
                              className="line-clamp-2 capitalize md:line-clamp-3"
                            >
                              {d.name}
                            </p>
                          </div>

                          <dl className="flex items-center gap-2">
                            <dt>
                              <Clock className="h-4 w-4" />
                            </dt>
                            <dd>{formatTimeToNow(parseJSON(d.createdAt))}</dd>
                          </dl>
                        </Link>
                      </li>
                    );
                  }
                })}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ChapterList;
