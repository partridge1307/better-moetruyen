import type { Chapter } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type ContinuousType = 'true' | 'false';

type navChapterProps = {
  prevChapter: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'> | null;
  nextChapter: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'> | null;
  mangaSlug: string;
};

const useNavChapter = ({
  prevChapter,
  nextChapter,
  mangaSlug,
}: navChapterProps) => {
  const router = useRouter();
  const savedContinuous =
    (localStorage.getItem('continuous') as ContinuousType) ?? 'true';
  const [isEnabled, setIsEnabled] = useState<ContinuousType>(savedContinuous);

  const setContinuous = (state: ContinuousType) => {
    localStorage.setItem('continuous', state);
    setIsEnabled(state);
  };
  const goToPrev = () =>
    isEnabled === 'false'
      ? null
      : router.push(
          !!prevChapter ? `/chapter/${prevChapter.id}` : `/manga/${mangaSlug}`
        );
  const goToNext = () =>
    isEnabled === 'false'
      ? null
      : router.push(
          !!nextChapter ? `/chapter/${nextChapter.id}` : `/manga/${mangaSlug}`
        );

  return {
    isEnabled,
    setContinuous,
    goToPrev,
    goToNext,
  };
};

export { useNavChapter };
