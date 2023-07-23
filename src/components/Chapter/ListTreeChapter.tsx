import { mangaChapterGroupByVolume } from '@/lib/query';
import { formatTimeToNow } from '@/lib/utils';
import parseJSON from 'date-fns/parseJSON';
import { Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/Accordion';

interface ListTreeChapterProps {
  mangaId: number;
}

const ListTreeChapter: FC<ListTreeChapterProps> = async ({ mangaId }) => {
  const volumes = await mangaChapterGroupByVolume(mangaId);

  return (
    <Accordion type="multiple">
      {volumes.map((v, idx) => (
        <AccordionItem key={`${idx}`} value={`${v.volume}`}>
          <AccordionTrigger className="hover:no-underline">
            Volume {v.volume}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-4">
              {v.data
                .sort((a, b) => b.index - a.index)
                .map((d, i) => {
                  if (d.isPublished) {
                    return (
                      <li
                        key={i}
                        className="dark:bg-zinc-800 px-3 py-2 md:py-3 rounded-lg space-y-1 md:space-y-2"
                      >
                        <Link
                          href={`/chapter/${d.id}`}
                          className="flex items-center justify-between max-sm:flex-col max-sm:items-start"
                        >
                          <div className="flex items-center gap-1 max-sm:text-sm text-base">
                            <p>Chap. {d.index}</p>
                            <p>-</p>
                            {d.name !== null && (
                              <p
                                title={`Chapter ${d.index}`}
                                className="line-clamp-2 capitalize md:line-clamp-3"
                              >
                                {d.name}
                              </p>
                            )}
                          </div>

                          <dl className="flex items-center gap-1 max-sm:text-sm text-base">
                            <dt>
                              <Clock className="h-4 w-4" />
                            </dt>
                            <dd>{formatTimeToNow(parseJSON(d.createdAt))}</dd>
                          </dl>
                        </Link>

                        {d.teamId && (
                          <Link
                            href={`/team/${d.teamId}`}
                            className="flex items-center gap-1"
                          >
                            {d.teamImage && (
                              <div className="relative h-5 w-5 md:h-6 md:w-6">
                                <Image
                                  fill
                                  sizes="0%"
                                  src={d.teamImage}
                                  alt="Team Image"
                                  className="rounded-full"
                                />
                              </div>
                            )}
                            {d.teamName && (
                              <p className="text-sm md:text-base font-medium">
                                {d.teamName}
                              </p>
                            )}
                          </Link>
                        )}
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

export default ListTreeChapter;
