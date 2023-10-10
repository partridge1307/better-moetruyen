import { formatTimeToNow } from '@/lib/utils';
import type { Chapter, Manga } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface LastestMangaCardProps {
  chapter: Pick<Chapter, 'name' | 'chapterIndex' | 'volume' | 'createdAt'> & {
    manga: Pick<Manga, 'slug' | 'name' | 'image' | 'review'>;
  };
}

const LastestMangaCard: FC<LastestMangaCardProps> = ({ chapter }) => {
  return (
    <Link
      scroll={false}
      href={`/manga/${chapter.manga.slug}`}
      className="grid grid-cols-[.6fr_1fr] md:grid-cols-[.3fr_1fr] gap-4 p-2 rounded-md transition-colors hover:dark:bg-zinc-900"
    >
      <div className="relative" style={{ aspectRatio: 4 / 3 }}>
        <Image
          fill
          sizes="(max-width: 640px) 20vw, 30vw"
          quality={40}
          src={chapter.manga.image}
          alt={`${chapter.manga.name} Thumbnail`}
          className="object-cover rounded-md"
        />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg lg:text-xl font-semibold line-clamp-2">
          {chapter.manga.name}
        </h1>

        <div>
          <div className="flex items-start gap-1">
            <dl className="shrink-0 text-sm leading-6 flex items-center gap-1">
              <dt>Vol. {chapter.volume}</dt>
              <dd>Ch. {chapter.chapterIndex}</dd>
            </dl>

            {!!chapter.name && <p>- {chapter.name}</p>}
          </div>

          <time dateTime={chapter.createdAt.toDateString()} className="text-sm">
            {formatTimeToNow(new Date(chapter.createdAt))}
          </time>
        </div>

        <p className="text-sm max-sm:line-clamp-3">{chapter.manga.review}</p>
      </div>
    </Link>
  );
};

export default LastestMangaCard;
