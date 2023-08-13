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
      className="relative grid grid-cols-[.0fr_1fr] gap-4 pr-2 rounded-lg overflow-clip dark:bg-zinc-900/75"
    >
      <div className="relative w-32 h-44 lg:w-40 lg:h-56">
        <Image
          fill
          sizes="(max-width: 640px) 30vw, 40vw"
          quality={40}
          src={chapter.manga.image}
          alt="Latest Manga Image"
          className="object-cover rounded-l-lg"
        />
      </div>

      <div className="relative flex flex-col gap-2 py-2 h-44 lg:h-56 max-sm:w-max">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold">
            {chapter.manga.name}
          </h2>
          <h3 className="text-xs lg:text-sm">
            {chapter.manga.author.map((a) => a.name).join(', ')}
          </h3>
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

        <p className="max-sm:hidden max-h-full overflow-auto md:scrollbar md:dark:scrollbar--dark">
          {chapter.manga.review}
        </p>
      </div>
    </Link>
  );
};

export default LatestMangaCard;
