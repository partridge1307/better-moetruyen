import { formatTimeToNow } from '@/lib/utils';
import type { Chapter, Manga, MangaAuthor } from '@prisma/client';
import { Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface LatestMangaCardProps {
  chapter: Pick<Chapter, 'volume' | 'chapterIndex' | 'name' | 'createdAt'> & {
    manga: Pick<Manga, 'id' | 'image' | 'name' | 'review'> & {
      author: Pick<MangaAuthor, 'name'>[];
    };
  };
}

const LatestMangaCard: FC<LatestMangaCardProps> = ({ chapter }) => {
  return (
    <Link
      href={`/manga/${chapter.manga.id}`}
      className="relative flex gap-4 dark:bg-zinc-900/75 rounded-lg pr-2 max-sm:pr-4 max-sm:w-max"
    >
      <div className="relative w-32 h-44 lg:w-40 lg:h-56">
        <Image
          fill
          sizes="(min-width: 640px) 20vw, (min-width: 1024px) 40vw"
          quality={40}
          src={chapter.manga.image}
          alt="Latest Manga Image"
          className="object-cover rounded-l-lg"
        />
      </div>

      <div className="relative py-2 flex flex-col gap-3 w-max h-44 lg:h-56">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold">
            {chapter.manga.name}
          </h2>
          <h6 className="text-xs md:text-sm">
            {chapter.manga.author.map((a) => a.name).join(', ')}
          </h6>
        </div>

        <div className="text-xs lg:text-sm space-y-1">
          <div className="flex md:flex-col lg:flex-row lg:items-center lg:gap-2">
            <h5>
              <span>Vol. {chapter.volume} </span> Ch. {chapter.chapterIndex}
            </h5>
            <h5>{chapter.name}</h5>
          </div>
          <p className="flex items-center gap-1">
            <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
            {formatTimeToNow(new Date(chapter.createdAt))}
          </p>
        </div>

        <h6 className="max-sm:hidden max-w-full max-h-full overflow-y-auto md:scrollbar md:dark:scrollbar--dark">
          {chapter.manga.review}
        </h6>
      </div>
    </Link>
  );
};

export default LatestMangaCard;
