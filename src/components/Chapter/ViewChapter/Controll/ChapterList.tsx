import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/Command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { groupBy } from '@/lib/utils';
import type { Chapter } from '@prisma/client';
import Link from 'next/link';
import { FC, memo } from 'react';

interface ChapterListProps {
  currentChapter: Pick<Chapter, 'volume' | 'chapterIndex'>;
  chapterList: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'>[];
}

const ChapterList: FC<ChapterListProps> = ({ currentChapter, chapterList }) => {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="chapter list button"
        className="rounded-md p-1 dark:bg-zinc-900/60"
      >
        <span>Vol. {currentChapter.volume}</span>{' '}
        <span>Ch. {currentChapter.chapterIndex}</span>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command className="dark:bg-zinc-900">
          <CommandInput placeholder="Chapter..." />
          <CommandEmpty>Không có kết quả</CommandEmpty>

          <CommandList>
            {!!chapterList?.length &&
              Object.entries(groupBy(chapterList, (chapter) => chapter.volume))
                .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
                .map(
                  (groupedChapter) =>
                    !!groupedChapter[1].length && (
                      <CommandGroup
                        key={groupedChapter[0]}
                        heading={`Vol. ${groupedChapter[0]}`}
                        className="[&_[cmdk-group-heading]]:text-sm"
                      >
                        {groupedChapter[1].map((chapter) => (
                          <CommandItem
                            key={chapter.id}
                            value={`${chapter.chapterIndex}`}
                          >
                            <Link
                              aria-label={`Chapter ${chapter.chapterIndex}`}
                              scroll={false}
                              href={`/chapter/${chapter.id}`}
                              className="w-full flex items-center gap-2 p-1 hover:cursor-pointer"
                            >
                              <p className="min-w-max">
                                Chap. {chapter.chapterIndex}
                              </p>
                              {!!!chapter.name && (
                                <p className="line-clamp-1">{chapter.name}</p>
                              )}
                            </Link>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )
                )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default memo(ChapterList);
