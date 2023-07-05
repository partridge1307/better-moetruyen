import { cn } from '@/lib/utils';
import { Chapter } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Separator } from '../ui/Separator';

interface ChapterControllProps {
  currentImage: number;
  chapter: Pick<Chapter, 'name' | 'chapterIndex' | 'volume' | 'images'> & {
    manga: {
      name: string;
      id: number;
    };
  };
  setCurrentImage(value: number): void;
  readingMode: 'vertical' | 'horizontal';
  setReadingMode(value: 'vertical' | 'horizontal'): void;
  progressBar: 'hidden' | 'fixed' | 'lightbar';
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
  setCurrentImage,
  readingMode,
  setReadingMode,
  progressBar,
  setProgressBar,
}) => {
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

  function onProgressBarHandler() {
    const target = progressBarArr[progressBarArr.indexOf(progressBar) + 1];
    setProgressBar(target ? target : 'hidden');
  }

  return (
    <div className="space-y-4">
      <button id="image-input-index" type="submit" className="hidden"></button>
      <div>
        <p>
          Chapter {chapter.chapterIndex} • <span>{chapter.name}</span>
        </p>
        <Link
          href={`/manga/${chapter.manga.id}`}
          className="text-lg font-medium text-orange-500"
        >
          {chapter.manga.name}
        </Link>
      </div>

      <div className="grid grid-cols-[1fr_.8fr_1fr] gap-x-4">
        <p className="dark:bg-zinc-900 py-1 rounded-md text-center">
          Vol. {chapter.volume} Ch. {chapter.chapterIndex}
        </p>

        <Popover>
          <PopoverTrigger className="dark:bg-zinc-900 py-1 rounded-md text-center">
            <span>Tr. {currentImage + 1}</span> / {chapter.images.length}
          </PopoverTrigger>
          <PopoverContent className="flex items-center w-fit rounded-xl dark:bg-zinc-900 dark:text-white">
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
                className="w-6 h-6 text-center bg-transparent outline-none"
                onInput={onInputHandler}
              />
            </form>
            <div className="flex gap-x-2 pr-1">
              <span>/</span>
              <div>{chapter.images.length}</div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger className="dark:bg-zinc-900 py-1 rounded-md text-center">
            Menu
          </PopoverTrigger>
          <PopoverContent className="dark:bg-zinc-900 min-w-max p-6">
            <div className="space-y-4">
              <p className="text-xl">Chế độ đọc</p>
              <div className="flex max-sm:justify-center gap-8">
                <div
                  className={cn(
                    'space-y-2 p-2 cursor-pointer rounded-xl border-4 dark:border-zinc-800',
                    readingMode === 'vertical' ? 'dark:border-orange-500' : null
                  )}
                  onClick={() => {
                    setReadingMode('vertical');
                  }}
                >
                  <div className="h-24 w-24 mx-auto md:h-32 md:w-32 overflow-hidden">
                    <div className="h-full w-full space-y-3 animate-up-down">
                      <div className="relative mx-auto w-24 h-20 dark:bg-zinc-800">
                        <div className="absolute h-1/2 w-full bg-gradient-to-b dark:from-zinc-900 to-transparent" />
                      </div>
                      <div className="relative mx-auto w-24 h-20 dark:bg-zinc-800">
                        <div className="absolute h-full w-full bg-gradient-to-t dark:from-zinc-900 to-transparent" />
                      </div>
                    </div>
                  </div>

                  <p className="text-center">Dọc</p>
                </div>

                <div
                  className={cn(
                    'space-y-2 p-2 cursor-pointer rounded-xl border-4 dark:border-zinc-800',
                    readingMode === 'horizontal'
                      ? 'dark:border-orange-500'
                      : null
                  )}
                  onClick={() => {
                    setReadingMode('horizontal');
                  }}
                >
                  <div className="h-24 w-24 mx-auto md:w-32 md:h-32 overflow-hidden">
                    <div className="h-full w-full flex items-center animate-left-right">
                      <div className="relative w-32 h-28 dark:bg-zinc-800 left-0">
                        <div className="absolute h-full w-full bg-gradient-to-r dark:from-zinc-900/70 to-transparent" />
                      </div>
                      <div className="relative w-20 h-28 dark:bg-zinc-800 -right-3">
                        <div className="absolute h-full w-full bg-gradient-to-l dark:from-zinc-900 to-transparent" />
                      </div>
                    </div>
                  </div>

                  <p className="text-center">Ngang</p>
                </div>
              </div>
            </div>

            <Separator className="my-6 dark:bg-slate-700/60 h-[.15rem] rounded-full" />

            <div className="space-y-2">
              <p className="text-xl">Thanh tiến trình đọc</p>
              <button
                className="text-center w-full text-lg py-2 rounded-lg transition-all dark:hover:bg-zinc-700/70 dark:hover:text-white/80 dark:bg-zinc-700 dark:text-white"
                onClick={() => onProgressBarHandler()}
              >
                <p className={progressBar === 'hidden' ? '' : 'hidden'}>Ẩn</p>
                <p className={progressBar === 'fixed' ? '' : 'hidden'}>
                  Luôn hiện
                </p>
                <p className={progressBar === 'lightbar' ? '' : 'hidden'}>
                  Lightbar
                </p>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ChapterControll;
