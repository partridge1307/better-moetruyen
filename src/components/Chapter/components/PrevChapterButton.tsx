import type { Chapter } from '@prisma/client';
import { FC, memo } from 'react';
import { buttonVariants } from '../../ui/Button';
import { cn } from '@/lib/utils';
import { MoveLeft } from 'lucide-react';
import Link from 'next/link';

interface NextChapterButtonProps {
  currentChapterIndex: number;
  chapterList:
    | Pick<Chapter, 'id' | 'chapterIndex' | 'name' | 'volume' | 'isPublished'>[]
    | null;
  className?: string;
  props?: React.HTMLAttributes<HTMLLinkElement>;
}

const PrevChapterButton: FC<NextChapterButtonProps> = ({
  chapterList,
  currentChapterIndex,
  className,
  ...props
}): JSX.Element | null => {
  if (chapterList) {
    const idx = chapterList.findIndex(
      (chapter) => chapter.chapterIndex === currentChapterIndex
    );
    if (idx === 0) return null;
    else
      return (
        <Link
          href={`/chapter/${chapterList[idx - 1].id}`}
          className={cn(
            buttonVariants(),
            'flex items-center justify-center gap-4',
            className
          )}
          {...props}
        >
          <MoveLeft className="w-6 h-6" />
          Chapter trước
        </Link>
      );
  } else return null;
};

export default memo(PrevChapterButton);
