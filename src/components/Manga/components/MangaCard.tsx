import { formatTimeToNow } from '@/lib/utils';
import type { Chapter, Manga } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';
import MangaImage from './MangaImage';

interface MangaCardProps {
  manga: Pick<Manga, 'slug' | 'name' | 'image' | 'review'> & {
    chapter: Pick<
      Chapter,
      'id' | 'volume' | 'chapterIndex' | 'name' | 'createdAt'
    >[];
  };
}

const MangaCard: FC<MangaCardProps> = ({ manga }) => {
  return (
    <div className="grid grid-cols-[.5fr_1fr] gap-2 rounded-md bg-background/40">
      <Link href={`/manga/${manga.slug}`}>
        <MangaImage
          priority
          sizes="(max-width: 640px) 21vw, 25vw"
          manga={manga}
        />
      </Link>

      <div className="space-y-1.5 md:space-y-3 px-2 py-0.5 pb-1">
        <Link href={`/manga/${manga.slug}`} className="md:space-y-1">
          <p className="text-xl md:text-2xl line-clamp-2 md:line-clamp-3 font-semibold">
            {manga.name}
          </p>
          <p className="line-clamp-3 max-sm:text-sm">{manga.review}</p>
        </Link>

        <div className="space-y-2.5">
          {manga.chapter.map((chapter) => (
            <Link
              href={`/chapter/${chapter.id}`}
              key={chapter.id}
              className="text-sm flex justify-between gap-2 p-1.5 rounded-md transition-colors hover:dark:bg-zinc-700 dark:bg-zinc-800"
            >
              <div className="flex items-center gap-1.5">
                <p className="shrink-0">
                  Vol. {chapter.volume} Ch. {chapter.chapterIndex}
                </p>
                {!!chapter.name && (
                  <>
                    <span>-</span>
                    <p className="line-clamp-1">{chapter.name}</p>
                  </>
                )}
              </div>

              <time
                dateTime={new Date(chapter.createdAt).toDateString()}
                className="line-clamp-1 max-sm:hidden"
              >
                {formatTimeToNow(new Date(chapter.createdAt))}
              </time>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MangaCard;
