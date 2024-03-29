'use client';

import { Button, buttonVariants } from '@/components/ui/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/Command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { Switch } from '@/components/ui/Switch';
import type { DirectionType } from '@/hooks/use-direction-reader';
import type { LayoutType } from '@/hooks/use-layout-reader';
import { cn } from '@/lib/utils';
import type { Chapter } from '@prisma/client';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Columns,
  Expand,
  File,
  Rows,
  Shrink,
} from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';
import { memo, useContext, useState } from 'react';
import {
  ContinuousDispatchContext,
  ContinuousValueContext,
  DirectionDispatchContext,
  DirectionValueContext,
  LayoutDispatchContext,
  LayoutValueContext,
  MenuToggleDispatchContext,
  MenuToggleValueContext,
} from './Context';
import { useFullscreen } from '@mantine/hooks';

interface MenuProps {
  chapterId: number;
  title: string;
  prevChapterUrl: string;
  nextChapterUrl: string;
  chapterList: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'>[];
}

const layoutOpts: { icon: React.ReactNode; title: string; type: LayoutType }[] =
  [
    {
      icon: <File />,
      title: 'Đơn',
      type: 'SINGLE',
    },
    {
      icon: <Columns />,
      title: 'Đôi',
      type: 'DOUBLE',
    },
    {
      icon: <Rows />,
      title: 'Dọc',
      type: 'VERTICAL',
    },
  ];

const directionOpts: {
  title: string;
  type: DirectionType;
}[] = [
  {
    title: 'Trái qua Phải',
    type: 'ltr',
  },
  {
    title: 'Phải qua trái',
    type: 'rtl',
  },
];

const Menu: FC<MenuProps> = ({
  chapterId,
  title,
  prevChapterUrl,
  nextChapterUrl,
  chapterList,
}) => {
  const menuToggle = useContext(MenuToggleValueContext);
  const setMenuToggle = useContext(MenuToggleDispatchContext);
  const layout = useContext(LayoutValueContext);
  const setLayout = useContext(LayoutDispatchContext);
  const direction = useContext(DirectionValueContext);
  const setDirection = useContext(DirectionDispatchContext);
  const isContinuosEnabled = useContext(ContinuousValueContext);
  const setContinuous = useContext(ContinuousDispatchContext);

  const { toggle, fullscreen } = useFullscreen();
  const [value, setValue] = useState(
    chapterList.find((chapter) => chapter.id === chapterId)
  );

  return (
    <div
      className={cn(
        'absolute top-0 right-0 inset-y-0 w-full md:w-[24rem] z-20 transition-transform duration-300 translate-x-full',
        {
          'translate-x-0': menuToggle,
        },
        'p-4 bg-primary-foreground overflow-y-auto md:border-l md:border-foreground/50'
      )}
    >
      <div className="relative flex justify-center">
        <button
          tabIndex={-1}
          type="button"
          aria-label="close menu button"
          className="absolute top-1/2 -translate-y-1/2 left-0 p-1 rounded-md transition-colors hover:bg-muted"
          onClick={() => setMenuToggle((prev) => !prev)}
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <Link
          href="/"
          aria-label="homepage link button"
          className="text-3xl font-semibold"
        >
          Moetruyen
        </Link>
      </div>

      <p className="text-xl text-center line-clamp-2 mt-7">{title}</p>

      <div className="mt-8 space-y-1.5">
        <p className="text-xl">Chapter</p>
        <div className="flex items-center gap-3">
          <Link
            href={prevChapterUrl}
            aria-label="previous chapter link button"
            className={buttonVariants({ variant: 'secondary' })}
          >
            <ChevronLeft />
          </Link>
          <Popover>
            <PopoverTrigger asChild>
              <button
                aria-label="chapter list button"
                className={buttonVariants({
                  variant: 'secondary',
                  className:
                    'flex-1 flex justify-center items-center space-x-1',
                })}
              >
                <span className="line-clamp-1">
                  Vol. {value?.volume} Ch. {value?.chapterIndex}
                  {!!value?.name && ` - ${value.name}`}
                </span>
                <ChevronRight className="rotate-90" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0.5">
              <Command>
                <CommandInput placeholder="Chapter" />
                <CommandEmpty>Không tìm thấy Chapter</CommandEmpty>
                <CommandGroup className="max-h-72 overflow-y-auto md:scrollbar md:dark:scrollbar--dark">
                  {chapterList.map((chapter) => (
                    <CommandItem
                      key={chapter.id}
                      value={`${chapter.chapterIndex}`}
                      onSelect={() => setValue(chapter)}
                      className="p-0 mt-1.5"
                    >
                      <Link
                        href={`/chapter/${chapter.id}`}
                        className="flex-1 flex items-center gap-1 p-1.5"
                      >
                        {chapter.id === value?.id && (
                          <Check className="w-5 h-5" />
                        )}
                        <span className="line-clamp-1">
                          Vol. {chapter.volume} Ch. {chapter.chapterIndex}
                          {!!chapter.name && ` - ${chapter.name}`}
                        </span>
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Link
            href={nextChapterUrl}
            aria-label="next chapter link button"
            className={buttonVariants({ variant: 'secondary' })}
          >
            <ChevronRight />
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-1.5">
        <p className="text-xl">Kiểu đọc</p>

        <div className="flex items-center gap-3">
          {layoutOpts.map((opt, idx) => (
            <button
              tabIndex={-1}
              type="button"
              aria-label="layout change button"
              key={idx}
              className={cn(
                buttonVariants({ variant: 'secondary' }),
                'flex-1 gap-1 transition-colors z-[1]',
                {
                  'bg-primary text-primary-foreground hover:bg-primary/90':
                    layout === opt.type,
                }
              )}
              onClick={() => setLayout(opt.type)}
            >
              {opt.icon}
              {opt.title}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn('flex items-center gap-3 mt-3 duration-300 transition', {
          '-translate-y-full opacity-0': layout === 'VERTICAL',
        })}
      >
        {directionOpts.map((opt, idx) => (
          <button
            tabIndex={-1}
            disabled={layout === 'VERTICAL'}
            type="button"
            aria-label="layout change button"
            key={idx}
            className={cn(
              buttonVariants({ variant: 'secondary' }),
              'flex-1 gap-1 transition-colors',
              {
                'bg-primary text-primary-foreground hover:bg-primary/90':
                  direction === opt.type,
                '-z-[1]': layout === 'VERTICAL',
              }
            )}
            onClick={() => setDirection(opt.type)}
          >
            {opt.title}
          </button>
        ))}
      </div>

      <div
        className={cn(
          'mt-6 flex justify-between items-center transition-[margin] duration-300',
          {
            '-mt-7': layout === 'VERTICAL',
          }
        )}
      >
        <p>Tự động chuyển Chapter</p>
        <Switch
          aria-label="continuous chapter switch"
          aria-checked={isContinuosEnabled === 'true'}
          checked={isContinuosEnabled === 'true'}
          onCheckedChange={(checked) =>
            setContinuous(checked ? 'true' : 'false')
          }
        />
      </div>

      {!fullscreen ? (
        <Button
          variant={'secondary'}
          className="mt-6 w-full space-x-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle();
          }}
        >
          <Expand />
          <span>Toàn màn hình</span>
        </Button>
      ) : (
        <Button
          variant={'destructive'}
          className="mt-6 w-full space-x-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle();
          }}
        >
          <Shrink />
          <span>Thoát toàn màn hình</span>
        </Button>
      )}
    </div>
  );
};

export default memo(Menu);
