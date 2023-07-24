import { cn } from '@/lib/utils';
import type { Chapter } from '@prisma/client';
import { MoveRight } from 'lucide-react';
import Link from 'next/link';
import { FC, memo } from 'react';
import { buttonVariants } from '../ui/Button';

interface NextChapterButtonProps {
  currentChapterIndex: number;
  chapterList:
    | Pick<Chapter, 'id' | 'chapterIndex' | 'name' | 'volume' | 'isPublished'>[]
    | null;
  className?: string;
  props?: React.HTMLAttributes<HTMLLinkElement>;
}

const NextChapterButton: FC<NextChapterButtonProps> = ({
  chapterList,
  currentChapterIndex,
  className,
  ...props
}): JSX.Element | null => {
  if (chapterList) {
    const idx = chapterList.findIndex(
      (chapter) => chapter.chapterIndex === currentChapterIndex
    );
    if (idx === chapterList.length - 1) return null;
    else
      return (
        <Link
          href={`/chapter/${chapterList[idx + 1].id}`}
          className={cn(
            buttonVariants(),
            'flex items-center justify-center gap-4',
            className
          )}
          {...props}
        >
          Chapter sau
          <MoveRight className="w-6 h-6" />
        </Link>
      );
  } else return null;
};

export default memo(NextChapterButton);
