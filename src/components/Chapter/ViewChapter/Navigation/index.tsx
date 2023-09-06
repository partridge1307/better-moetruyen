'use client';

import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Chapter } from '@prisma/client';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, memo, useContext } from 'react';
import { ImageContext } from '..';
import { useWindowEvent } from '@mantine/hooks';

interface NavigationProps {
  currentChapterIdx: number;
  chapterList: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'>[];
}

const Navigation: FC<NavigationProps> = ({
  currentChapterIdx,
  chapterList,
}) => {
  const router = useRouter();
  const { images } = useContext(ImageContext);

  let hasPrev = true,
    hasNext = true;

  const idx = chapterList.findIndex(
    (chapter) => chapter.chapterIndex === currentChapterIdx
  );

  if (idx <= 0) {
    hasPrev = false;
  }
  if (idx >= chapterList.length - 1) {
    hasNext = false;
  }

  const keyDownHandler = (e: KeyboardEvent) => {
    if ((e.key === '[' || e.code === 'BracketLeft') && hasPrev) {
      router.push(`/chapter/${chapterList[idx - 1].id}`);
      return;
    }
    if ((e.key === ']' || e.code === 'BracketRight') && hasNext) {
      router.push(`/chapter/${chapterList[idx + 1].id}`);
      return;
    }
  };
  useWindowEvent('keydown', keyDownHandler);

  return (
    <>
      <button
        aria-label="navigate to previous chapter"
        disabled={!hasPrev}
        className={cn(buttonVariants(), 'space-x-2')}
        onClick={() => router.push(`/chapter/${chapterList[idx - 1].id}`)}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Chapter trước</span>
      </button>

      <button
        aria-label="scroll back to top"
        className={cn(buttonVariants(), 'space-x-2')}
        onClick={() => {
          images.find(Boolean)?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <ArrowUp className="w-5 h-5" />
        <span>Quay về đầu</span>
      </button>

      <button
        aria-label="navigate to next chapter"
        disabled={!hasNext}
        className={cn(buttonVariants(), 'space-x-2')}
        onClick={() => router.push(`/chapter/${chapterList[idx + 1].id}`)}
      >
        <span>Chapter sau</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </>
  );
};

export default memo(Navigation);
