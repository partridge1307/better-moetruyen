import { buttonVariants } from '@/components/ui/Button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { cn } from '@/lib/utils';
import { useCallback, useContext } from 'react';
import {
  ProgressBarContext,
  ProgressBarType,
  ReadingModeContext,
  ReadingType,
  SizeContext,
  SizeType,
} from '..';

const ProgressBarArray: ProgressBarType[] = ['HIDE', 'SHOW', 'LIGHTBAR'];
const SizeArray: SizeType[] = ['ORIGINAL', 'FITHEIGHT', 'FITWIDTH'];

const ChapterMenu = () => {
  const { readingMode, onReadingModeChange } = useContext(ReadingModeContext);
  const { size, onSizeChange } = useContext(SizeContext);
  const { progressBar, onProgressBarChange } = useContext(ProgressBarContext);

  const handleReadingModeChange = useCallback(
    (type: ReadingType) => {
      localStorage.setItem('readingMode', type);
      onReadingModeChange(type);
    },
    [onReadingModeChange]
  );

  const handleSizeChange = useCallback(
    (size: SizeType) => {
      localStorage.setItem('sizeType', size);
      onSizeChange(size);
    },
    [onSizeChange]
  );

  const handleProgressBarChange = useCallback(
    (type: ProgressBarType) => {
      localStorage.setItem('progressBar', type);
      onProgressBarChange(type);
    },
    [onProgressBarChange]
  );

  return (
    <Popover>
      <PopoverTrigger
        aria-label="menu button"
        className="rounded-md p-1 dark:bg-zinc-900/60"
      >
        Menu
      </PopoverTrigger>

      <PopoverContent className="p-2 divide-y dark:divide-zinc-700 dark:bg-zinc-900">
        <div className="space-y-1">
          <h1 className="text-lg lg:text-xl font-medium">Kiểu đọc</h1>
          <ReadingModeShell
            readingMode={readingMode}
            onReadingModeChange={handleReadingModeChange}
          />
        </div>

        <div className="py-2 space-y-1">
          <h1 className="text-lg lg:text-xl font-medium">Kích cỡ ảnh</h1>
          <SizeModeShell size={size} onSizeChange={handleSizeChange} />
        </div>

        <div className="py-2 space-y-1">
          <h1 className="text-lg lg:text-xl font-medium">Thanh tiến trình</h1>
          <ProgressBarShell
            progressBar={progressBar}
            onProgressBarChange={handleProgressBarChange}
          />
        </div>

        <button
          aria-label="scroll to navigation section"
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'w-full transition-colors dark:bg-zinc-700 hover:dark:bg-zinc-700/70'
          )}
          onClick={() => {
            const target = document.getElementById('navigation-section');
            target?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Điều hướng
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default ChapterMenu;

const ReadingModeShell = ({
  readingMode,
  onReadingModeChange,
}: {
  readingMode: ReadingType;
  // eslint-disable-next-line no-unused-vars
  onReadingModeChange: (type: ReadingType) => void;
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        aria-label="vertical reading"
        className="p-2 space-y-1"
        onClick={() => onReadingModeChange('VERTICAL')}
      >
        <div
          className={`overflow-hidden ${
            readingMode === 'VERTICAL'
              ? 'rounded-xl border-[3px] dark:border-orange-500'
              : 'pt-1'
          }`}
        >
          <div className="max-h-40 space-y-4 motion-safe:animate-up-down">
            <div className="w-28 h-32 rounded-md dark:bg-zinc-950/40" />
            <div className="w-28 h-32 rounded-md dark:bg-zinc-950/40" />
          </div>
        </div>

        <p>Dọc</p>
      </button>

      <button
        aria-label="horizontal reading"
        className="p-2 space-y-1"
        onClick={() => onReadingModeChange('HORIZONTAL')}
      >
        <div
          className={`overflow-hidden ${
            readingMode === 'HORIZONTAL'
              ? 'rounded-xl border-[3px] dark:border-orange-500'
              : 'pt-1'
          }`}
        >
          <div className="max-w-[7em] flex gap-4 motion-safe:animate-left-right">
            <div className="flex-shrink-0 w-28 h-40 rounded-md dark:bg-zinc-950/40" />
            <div className="flex-shrink-0 w-28 h-40 rounded-md dark:bg-zinc-950/40" />
            <div />
          </div>
        </div>

        <p>Ngang</p>
      </button>
    </div>
  );
};

const SizeModeShell = ({
  size,
  onSizeChange,
}: {
  size: SizeType;
  // eslint-disable-next-line no-unused-vars
  onSizeChange: (type: SizeType) => void;
}) => {
  return (
    <button
      aria-label="size change button"
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'w-full transition-colors dark:bg-zinc-700 hover:dark:bg-zinc-700/70'
      )}
      onClick={() => {
        const idx = SizeArray.indexOf(size);

        idx === SizeArray.length - 1
          ? onSizeChange(SizeArray[0])
          : onSizeChange(SizeArray[idx + 1]);
      }}
    >
      {size === 'ORIGINAL'
        ? 'Gốc'
        : size === 'FITWIDTH'
        ? 'Ngang'
        : size === 'FITHEIGHT'
        ? 'Dọc'
        : null}
    </button>
  );
};

const ProgressBarShell = ({
  progressBar,
  onProgressBarChange,
}: {
  progressBar: ProgressBarType;
  // eslint-disable-next-line no-unused-vars
  onProgressBarChange: (type: ProgressBarType) => void;
}) => {
  return (
    <button
      aria-label="progress bar change button"
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'w-full transition-colors dark:bg-zinc-700 hover:dark:bg-zinc-700/70'
      )}
      onClick={() => {
        const idx = ProgressBarArray.indexOf(progressBar);

        idx === ProgressBarArray.length - 1
          ? onProgressBarChange(ProgressBarArray[0])
          : onProgressBarChange(ProgressBarArray[idx + 1]);
      }}
    >
      {progressBar === 'HIDE'
        ? 'Ẩn'
        : progressBar === 'SHOW'
        ? 'Hiện'
        : progressBar === 'LIGHTBAR'
        ? 'Mờ'
        : null}
    </button>
  );
};
