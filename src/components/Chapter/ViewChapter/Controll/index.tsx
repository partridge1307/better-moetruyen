import type { Chapter, Manga } from '@prisma/client';
import Link from 'next/link';
import { FC, memo } from 'react';
import ChapterList from './ChapterList';
import ChapterPage from './ChapterPage';
import ChapterMenu from './ChapterMenu';

interface ControllProps {
  chapter: Pick<Chapter, 'volume' | 'chapterIndex' | 'name'> & {
    manga: Pick<Manga, 'slug' | 'name'>;
  };
  chapterList: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'>[];
}

const Controll: FC<ControllProps> = ({ chapter, chapterList }) => {
  return (
    <section className="space-y-8">
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
    </section>
  );
};

export default memo(Controll);
