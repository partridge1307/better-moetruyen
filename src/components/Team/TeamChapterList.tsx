import { formatTimeToNow, groupBy } from '@/lib/utils';
import type { Chapter, Manga } from '@prisma/client';
import { Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface ChapterListProps {
  chapter: (Pick<
    Chapter,
    'id' | 'name' | 'chapterIndex' | 'volume' | 'createdAt'
  > & {
    manga: Pick<Manga, 'slug' | 'name' | 'image'>;
  })[];
}

const TeamChapterList: FC<ChapterListProps> = ({ chapter }) => {
  return (
    !!chapter &&
    Object.entries(
      groupBy(
        chapter.flatMap((c) => ({
          mangaSlug: c.manga.slug,
          mangaName: c.manga.name,
          mangaImage: c.manga.image,
          chapterId: c.id,
          chapterName: c.name,
          chapterIndex: c.chapterIndex,
          chapterVolume: c.volume,
          chapterCreatedAt: c.createdAt,
        })),
        (c) => c.mangaName
      )
    ).map(([K, V]) => (
      <div
        key={K}
        className="flex max-sm:flex-col gap-4 p-2 dark:bg-zinc-700 rounded-md"
      >
        <Link
          href={`/manga/${V[0].mangaSlug}`}
          className="relative max-sm:self-center w-24 h-32"
        >
          <Image
            fill
            sizes="0%"
            src={V[0].mangaImage}
            alt="Manga Image"
            className="rounded-md object-cover"
          />
        </Link>
        <div className="w-full space-y-2">
          <Link
            href={`/manga/${V[0].mangaSlug}`}
            className="text-lg font-semibold"
          >
            {V[0].mangaName}
          </Link>
          <div className="max-h-32 overflow-auto space-y-2 scrollbar dark:bg-zinc-800 rounded-md">
            {V.map((info, idx) => (
              <Link
                key={idx}
                href={`/chapter/${info.chapterId}`}
                className="w-full flex max-sm:flex-col max-sm:gap-2 justify-between rounded-md dark:bg-zinc-900 hover:dark:bg-zinc-800 transition-colors px-3 py-2"
              >
                <div className="flex max-sm:flex-col md:gap-2">
                  <div className="flex gap-2">
                    <p>Vol. {info.chapterVolume}</p>
                    <p>Ch. {info.chapterIndex}</p>
                  </div>
                  <span className="max-sm:hidden">-</span>
                  {info.chapterName && <p>{info.chapterName}</p>}
                </div>
                <p className="flex items-center gap-1">
                  {formatTimeToNow(info.chapterCreatedAt)}
                  <Clock className="w-4 h-4" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    ))
  );
};

export default TeamChapterList;
