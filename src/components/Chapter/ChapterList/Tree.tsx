import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import { mangaChapterGroupByVolume } from '@/lib/query';
import { formatTimeToNow } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface TreeProps {
  mangaId: number;
}

type LatestChapterType = {
  id: number;
  createdAt: Date;
};

const Tree: FC<TreeProps> = async ({ mangaId }) => {
  const groups = await mangaChapterGroupByVolume(mangaId);

  let latestChapter: LatestChapterType | undefined;

  return (
    !!groups?.length && (
      <Accordion
        type="multiple"
        defaultValue={groups.map((v) => `${v.volume}`)}
      >
        {groups.map((group, idx) => (
          <AccordionItem key={idx} value={`${group.volume}`}>
            <AccordionTrigger className="hover:no-underline">
              Volume {group.volume}
            </AccordionTrigger>

            <AccordionContent asChild className="text-base">
              <ul className="space-y-5">
                {group.data
                  .sort((a, b) => b.index - a.index)
                  .map((chapter) => {
                    if (!latestChapter) {
                      latestChapter = {
                        id: chapter.id,
                        createdAt: new Date(chapter.createdAt),
                      };
                    } else if (
                      new Date(chapter.createdAt).getTime() >
                      latestChapter.createdAt.getTime()
                    ) {
                      latestChapter = {
                        id: chapter.id,
                        createdAt: new Date(chapter.createdAt),
                      };
                    }

                    const date = new Date(
                      Date.parse(new Date(chapter.createdAt).toUTCString()) -
                        new Date(chapter.createdAt).getTimezoneOffset() * 60000
                    );

                    return (
                      <li key={chapter.id} className="flex gap-2 md:gap-4">
                        <Link
                          href={`/chapter/${chapter.id}`}
                          className="block flex-1 py-1 px-1.5 rounded-md space-y-1.5 transition-colors bg-muted hover:bg-muted/70"
                        >
                          <div className="flex items-center gap-1.5 md:text-lg font-semibold">
                            {latestChapter.id === chapter.id && (
                              <span className="shrink-0 py-0.5 px-1 md:px-1.5 mr-1 md:mr-1.5 text-sm rounded-md bg-foreground text-primary-foreground">
                                NEW
                              </span>
                            )}
                            <p className="line-clamp-1">
                              Ch. {chapter.index}
                              {!!chapter.name && ` - ${chapter.name}`}
                            </p>
                          </div>

                          <time
                            dateTime={date.toDateString()}
                            className="block"
                          >
                            {formatTimeToNow(date)}
                          </time>
                        </Link>

                        {!!chapter.teamId &&
                          !!chapter.teamName &&
                          !!chapter.teamImage && (
                            <Link
                              href={`/team/${chapter.teamId}`}
                              className="flex items-center gap-3 py-1 px-2 rounded-md transition-colors bg-muted hover:bg-muted/70"
                            >
                              <div className="relative w-10 h-10 aspect-square">
                                <Image
                                  fill
                                  sizes="(max-width: 640px) 10vw, 15vw"
                                  quality={40}
                                  src={chapter.teamImage}
                                  alt={`${chapter.teamName} Cover`}
                                  className="object-cover rounded-full"
                                />
                              </div>

                              <p className="text-lg font-semibold line-clamp-1 md:max-w-[7rem] lg:max-w-[10rem] max-sm:hidden">
                                {chapter.teamName}
                              </p>
                            </Link>
                          )}
                      </li>
                    );
                  })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
  );
};

export default Tree;
