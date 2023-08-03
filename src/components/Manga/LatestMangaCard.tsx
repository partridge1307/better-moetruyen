import { formatTimeToNow } from '@/lib/utils';
import type { Chapter, Manga, MangaAuthor } from '@prisma/client';
import { Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface LatestMangaCardProps {
  chapter: Pick<
    Chapter,
    'id' | 'volume' | 'chapterIndex' | 'name' | 'createdAt'
  > & {
    manga: Pick<Manga, 'id' | 'image' | 'name' | 'review'> & {
      author: Pick<MangaAuthor, 'name'>[];
    };
  };
}

const LatestMangaCard: FC<LatestMangaCardProps> = ({ chapter }) => {
  return (
    <Link
      href={`/manga/${chapter.manga.id}`}
      className="relative flex gap-4 dark:bg-zinc-900/75 rounded-lg pr-2 max-sm:pr-4"
    >
      <div className="relative w-32 h-44 md:w-36 md:h-52 lg:w-40 lg:h-56">
        <Image
          fill
          sizes="0%"
          priority
          src={chapter.manga.image}
          alt="Latest Manga Image"
          className="object-cover rounded-l-lg"
        />
      </div>

      <div className="py-2 flex flex-col gap-3 min-w-max">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold">
            {chapter.manga.name}
          </h2>
          <h6 className="text-xs md:text-sm">
            {chapter.manga.author.map((a) => a.name).join(', ')}
          </h6>
        </div>

        <div className="max-sm:text-sm space-y-1">
          <div className="flex max-md:flex-col lg:items-center md:gap-2">
            <h5>
              <span>Vol. {chapter.volume} </span> Ch. {chapter.chapterIndex}
            </h5>
            <h5>{chapter.name}</h5>
          </div>
          <p className="flex items-center gap-1 text-sm max-sm:text-xs">
            <Clock className="max-sm:w-3 max-sm:h-3 w-4 h-4" />
            {formatTimeToNow(new Date(chapter.createdAt))}
          </p>
        </div>

        <h6 className="max-sm:hidden md:max-w-md lg:max-w-lg max-h-20 overflow-auto md:scrollbar md:dark:scrollbar--dark">
          {chapter.manga.review}
        </h6>
      </div>
    </Link>
  );
};

export default LatestMangaCard;
