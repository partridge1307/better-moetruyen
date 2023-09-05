import type { Chapter, Manga } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import ChapterPage from './ChapterPage';

const ChapterList = dynamic(() => import('./ChapterList'), { ssr: false });
const ChapterMenu = dynamic(() => import('./ChapterMenu'), { ssr: false });

interface ControllProps {
  chapter: Pick<Chapter, 'volume' | 'chapterIndex' | 'name'> & {
    manga: Pick<Manga, 'slug' | 'name'>;
  };
  chapterList: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'>[];
}

const Controll: FC<ControllProps> = ({ chapter, chapterList }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1>
          <span>Vol. {chapter.volume}</span>{' '}
          <span>Ch. {chapter.chapterIndex}</span>
          {!!chapter.name && <span> - {chapter.name}</span>}
        </h1>
        <Link
          href={`/manga/${chapter.manga.slug}`}
          className="text-lg lg:text-xl font-semibold dark:text-orange-500"
        >
          {chapter.manga.name}
        </Link>
      </div>

      <div className="grid grid-cols-[1fr_.7fr_1fr] gap-2 lg:gap-6">
        <ChapterList currentChapter={chapter} chapterList={chapterList} />
        <ChapterPage />
        <ChapterMenu />
      </div>
    </div>
  );
};

export default Controll;
