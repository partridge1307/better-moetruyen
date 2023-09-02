import { mangaChapterGroupByVolume } from '@/lib/query';
import { cn, formatTimeToNow } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../ui/Accordion';

interface ListTreeChapterProps {
  mangaId: number;
}

const ListTreeChapter: FC<ListTreeChapterProps> = async ({ mangaId }) => {
  const volumes = await mangaChapterGroupByVolume(mangaId);

  return (
    !!volumes?.length && (
      <Accordion
        type="multiple"
        defaultValue={volumes.map((v) => `${v.volume}`)}
      >
        {volumes.map((volume, idx) => (
          <AccordionItem key={`${idx}`} value={`${volume.volume}`}>
            <AccordionTrigger className="hover:no-underline">
              Volume {volume.volume}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="text-base px-2 divide-y dark:divide-zinc-700">
                {volume.data
                  .sort((a, b) => b.index - a.index)
                  .map((chapter) => (
                    <li
                      key={chapter.id}
                      className={
                        !!chapter.teamId &&
                        !!chapter.teamImage &&
                        !!chapter.teamName
                          ? 'flex flex-wrap items-center py-4'
                          : undefined
                      }
                    >
                      <Link
                        scroll={false}
                        href={`/chapter/${chapter.id}`}
                        className={cn(
                          'relative block p-2',
                          !!chapter.teamId &&
                            !!chapter.teamName &&
                            !!chapter.teamImage &&
                            "flex-1 pl-4 after:content-[''] after:absolute after:inset-0 after:-z-10 after:-skew-x-12 after:transition-colors after:dark:bg-zinc-700/90 after:hover:dark:bg-zinc-700/60",
                          !!!chapter.teamId &&
                            !!!chapter.teamName &&
                            !!!chapter.teamImage &&
                            'rounded-md hover:transition-colors dark:bg-zinc-800/90 hover:dark:bg-zinc-800/70'
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <p>Ch. {chapter.index}</p>
                          {!!chapter.name && <p>- {chapter.name}</p>}
                        </div>
                        <time
                          dateTime={new Date(chapter.createdAt).toDateString()}
                          className="text-sm"
                        >
                          {formatTimeToNow(new Date(chapter.createdAt))}
                        </time>
                      </Link>

                      {!!chapter.teamId &&
                        !!chapter.teamName &&
                        !!chapter.teamImage && (
                          <Link
                            href={`/team/${chapter.teamId}`}
                            className="max-sm:hidden relative flex items-center gap-3 p-2 pr-4 after:content-[''] after:absolute after:inset-0 after:-z-10 after:-skew-x-12 after:transition-colors after:dark:bg-zinc-700/90 after:hover:dark:bg-zinc-700/60"
                          >
                            <div className="relative aspect-square w-12 h-12">
                              <Image
                                fill
                                sizes="(max-width: 640px) 5vw, 15vw"
                                quality={40}
                                src={chapter.teamImage}
                                alt={`${chapter.teamName} Thumbnail`}
                                className="rounded-full object-cover"
                              />
                            </div>
                            <p className="max-w-[10rem] line-clamp-1">
                              {chapter.teamName}
                            </p>
                          </Link>
                        )}
                    </li>
                  ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
  );
};

export default ListTreeChapter;
