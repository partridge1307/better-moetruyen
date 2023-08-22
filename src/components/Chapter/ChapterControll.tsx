'use client';

import { cn } from '@/lib/utils';
import type { Chapter } from '@prisma/client';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { FC, useCallback, useMemo } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/Command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Separator } from '../ui/Separator';
import { useMediaQuery } from '@mantine/hooks';
import dynamic from 'next/dynamic';

const ReportChapter = dynamic(() => import('@/components/Report/Chapter'), {
  ssr: false,
});

interface ChapterControllProps {
  currentImage: number;
  chapter: Pick<
    Chapter,
    'id' | 'name' | 'chapterIndex' | 'volume' | 'images'
  > & {
    manga: {
      name: string;
      id: number;
    };
  };
  chapterList:
    | Pick<Chapter, 'id' | 'chapterIndex' | 'name' | 'volume' | 'isPublished'>[]
    | null;
  // eslint-disable-next-line no-unused-vars
  setCurrentImage(value: number): void;
  readingMode: 'vertical' | 'horizontal';
  // eslint-disable-next-line no-unused-vars
  setReadingMode(value: 'vertical' | 'horizontal'): void;
  progressBar: 'hidden' | 'fixed' | 'lightbar';
  // eslint-disable-next-line no-unused-vars
  setProgressBar(value: 'hidden' | 'fixed' | 'lightbar'): void;
}

const progressBarArr: Array<'hidden' | 'fixed' | 'lightbar'> = [
  'hidden',
  'fixed',
  'lightbar',
];

const ChapterControll: FC<ChapterControllProps> = ({
  currentImage,
  chapter,
  chapterList,
  setCurrentImage,
  readingMode,
  setReadingMode,
  progressBar,
  setProgressBar,
}) => {
  const matches = useMediaQuery('(min-width: 768px)');

  function onInputHandler(e: React.ChangeEvent<HTMLInputElement>) {
    if (Number(e.target.value) > Number(e.target.max)) {
      e.target.value = e.target.max;
    } else if (Number(e.target.value) < Number(e.target.min)) {
      e.target.value = e.target.min;
    }
  }
  function onSubmitHandler() {
    const idx = (document.getElementById('index-input') as HTMLInputElement)
      .value;
    setCurrentImage(Number(idx) - 1);
  }

  const onProgressBarHandler = useCallback(() => {
    const target = progressBarArr[progressBarArr.indexOf(progressBar) + 1];
    setProgressBar(target ? target : 'hidden');
  }, [progressBar, setProgressBar]);

  const ChapterList = useMemo(() => {
    return (
      <Popover>
        <PopoverTrigger className="rounded-md py-1 dark:bg-zinc-900">
          <p className="flex justify-center items-center gap-1 max-sm:text-sm">
            Vol. {chapter.volume} Ch. {chapter.chapterIndex}
            <ChevronDown className="max-sm:hidden w-5 h-5" />
          </p>
        </PopoverTrigger>

        <PopoverContent>
          <Command>
            <CommandInput placeholder="Chapter..." />

            <CommandList>
              <CommandEmpty>Không tìm thấy chapter</CommandEmpty>
              {chapterList && (
                <CommandGroup>
                  {chapterList.map((chapter, idx) => {
                    if (chapter.isPublished) {
                      return (
                        <CommandItem key={idx}>
                          <Link
                            scroll={false}
                            href={`/chapter/${chapter.id}`}
                            className="w-full"
                          >
                            Vol. {chapter.volume} Ch. {chapter.chapterIndex}
                          </Link>
                        </CommandItem>
                      );
                    }
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }, [chapter.chapterIndex, chapter.volume, chapterList]);

  const Menu = useMemo(() => {
    return (
      <Popover>
        <PopoverTrigger className="rounded-md py-1 dark:bg-zinc-900">
          <p className="flex justify-center items-center gap-1">
            Menu
            <ChevronDown className="max-sm:hidden w-5 h-5" />
          </p>
        </PopoverTrigger>
        <PopoverContent className="min-w-max p-6 dark:bg-zinc-900">
          <div className="space-y-4">
            <p className="text-xl">Chế độ đọc</p>
            <div className="flex gap-8 max-sm:justify-center">
              <div
                className={cn(
                  'cursor-pointer space-y-2 rounded-xl border-4 p-2 dark:border-zinc-800',
                  readingMode === 'vertical' ? 'dark:border-orange-500' : null
                )}
                onClick={() => {
                  setReadingMode('vertical');
                }}
              >
                <div className="mx-auto h-24 w-24 overflow-hidden md:h-32 md:w-32">
                  <div className="h-full w-full motion-safe:animate-up-down space-y-3">
                    <div className="relative mx-auto h-20 w-24 dark:bg-zinc-800">
                      <div className="absolute h-1/2 w-full bg-gradient-to-b dark:from-zinc-900" />
                    </div>
                    <div className="relative mx-auto h-20 w-24 dark:bg-zinc-800">
                      <div className="absolute h-full w-full bg-gradient-to-t dark:from-zinc-900" />
                    </div>
                  </div>
                </div>

                <p className="text-center">Dọc</p>
              </div>

              <div
                className={cn(
                  'cursor-pointer space-y-2 rounded-xl border-4 p-2 dark:border-zinc-800',
                  readingMode === 'horizontal' ? 'dark:border-orange-500' : null
                )}
                onClick={() => {
                  setReadingMode('horizontal');
                }}
              >
                <div className="mx-auto h-24 w-24 overflow-hidden md:h-32 md:w-32">
                  <div className="flex h-full w-full motion-safe:animate-left-right items-center">
                    <div className="relative left-0 h-28 w-32 dark:bg-zinc-800">
                      <div className="absolute h-full w-full bg-gradient-to-r dark:from-zinc-900/70" />
                    </div>
                    <div className="relative -right-3 h-28 w-20 dark:bg-zinc-800">
                      <div className="absolute h-full w-full bg-gradient-to-l dark:from-zinc-900" />
                    </div>
                  </div>
                </div>

                <p className="text-center">Ngang</p>
              </div>
            </div>
          </div>

          <Separator className="my-6 h-[.15rem] rounded-full dark:bg-slate-700/60" />

          {matches && (
            <div className="space-y-2">
              <p className="text-xl">Thanh tiến trình đọc</p>
              <button
                className="w-full rounded-lg py-2 text-center text-lg transition-all dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-700/70 dark:hover:text-white/80"
                onClick={() => onProgressBarHandler()}
              >
                <p className={progressBar === 'hidden' ? '' : 'hidden'}>Ẩn</p>
                <p className={progressBar === 'fixed' ? '' : 'hidden'}>
                  Luôn hiện
                </p>
                <p className={progressBar === 'lightbar' ? '' : 'hidden'}>
                  Làm mờ
                </p>
              </button>
            </div>
          )}

          <ReportChapter id={chapter.id} />
        </PopoverContent>
      </Popover>
    );
  }, [
    chapter.id,
    matches,
    onProgressBarHandler,
    progressBar,
    readingMode,
    setReadingMode,
  ]);

  return (
    <div className="space-y-4">
      <button id="image-input-index" type="submit" className="hidden"></button>
      <div>
        <p>
          Chapter {chapter.chapterIndex}
          {chapter.name && (
            <>
              {' '}
              • <span>{chapter.name}</span>
            </>
          )}
        </p>
        <Link
          href={`/manga/${chapter.manga.id}/${chapter.manga.name
            .split(' ')
            .join('-')}`}
          className="text-lg font-medium text-orange-500"
        >
          {chapter.manga.name}
        </Link>
      </div>

      <div className="grid grid-cols-[1fr_.8fr_1fr] gap-x-2 md:gap-x-4">
        {ChapterList}

        <Popover>
          <PopoverTrigger className="rounded-md py-1 dark:bg-zinc-900">
            <p className="flex items-center justify-center md:gap-1 max-sm:text-sm">
              <span>
                Tr. {currentImage + 1} / {chapter.images.length}
              </span>
              <ChevronDown className="max-sm:hidden w-5 h-5" />
            </p>
          </PopoverTrigger>
          <PopoverContent className="flex w-fit items-center rounded-xl dark:bg-zinc-900 dark:text-white">
            <form
              id="image-input-index"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitHandler();
              }}
            >
              <input
                id="index-input"
                type="number"
                min={1}
                max={chapter.images.length}
                className="h-6 w-6 bg-transparent text-center outline-none"
                onInput={onInputHandler}
              />
            </form>
            <div className="flex gap-x-2 pr-1">
              <span>/</span>
              <div>{chapter.images.length}</div>
            </div>
          </PopoverContent>
        </Popover>

        {Menu}
      </div>
    </div>
  );
};

export default ChapterControll;
