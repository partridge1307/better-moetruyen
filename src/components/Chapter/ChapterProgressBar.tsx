import { cn } from '@/lib/utils';
import { FC } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/HoverCard';

interface ChapterProgressBarProps {
  currentImage: number;
  totalImage: string[];
  progressBar: 'hidden' | 'lightbar' | 'fixed';
  jumptoImage: (value: number) => void;
}

const ChapterProgressBar: FC<ChapterProgressBarProps> = ({
  currentImage,
  totalImage,
  progressBar,
  jumptoImage,
}) => {
  return (
    currentImage < totalImage.length && (
      <div
        className={cn(
          'absolute bottom-0 flex h-8 w-full items-center gap-2 rounded-full p-2 px-6 transition-all dark:hover:bg-zinc-700 max-sm:hidden',
          progressBar === 'hidden'
            ? 'opacity-0 hover:opacity-100'
            : progressBar === 'lightbar'
            ? 'items-end p-0 dark:hover:bg-transparent gap-[0.15rem] h-6'
            : null
        )}
      >
        {totalImage.map((_, idx) => (
          <HoverCard key={idx} openDelay={100} closeDelay={100}>
            {progressBar === 'lightbar' ? (
              <HoverCardTrigger asChild>
                <div
                  className="relative h-3/4 w-full cursor-pointer rounded-t-md transition-all bg-gradient-to-t dark:from-zinc-900/70"
                  onClick={() => jumptoImage(idx)}
                >
                  <div
                    className={cn(
                      'absolute bottom-0 h-[.15rem] w-full rounded-md',
                      idx <= currentImage
                        ? 'dark:bg-orange-500'
                        : 'dark:bg-zinc-900'
                    )}
                  />
                </div>
              </HoverCardTrigger>
            ) : (
              <HoverCardTrigger
                className={cn(
                  'h-1/3 w-full cursor-pointer rounded-md transition-all hover:h-full dark:bg-zinc-900',
                  idx <= currentImage ? 'dark:bg-orange-500' : null,
                  progressBar === 'hidden' ? 'h-2/5' : null
                )}
                onClick={() => jumptoImage(idx)}
              />
            )}
            <HoverCardContent className="w-fit rounded-2xl p-3 dark:bg-zinc-900/80 dark:text-white">
              {idx + 1}
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    )
  );
};

export default ChapterProgressBar;
