import type { Manga, MangaAuthor } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { FC, memo } from 'react';

interface AdvancedMangaCardProps {
  manga: Pick<Manga, 'slug' | 'image' | 'review' | 'name'> & {
    _count: {
      chapter: number;
    };
    author: Pick<MangaAuthor, 'name'>[];
  };
}

const AdvancedMangaCard: FC<AdvancedMangaCardProps> = ({ manga }) => {
  return (
    <Link
      href={`/manga/${manga.slug}`}
      className="relative flex gap-4 dark:bg-zinc-900/75 rounded-lg pr-2 max-sm:pr-4 max-sm:w-max"
    >
      <Image
        width={200}
        height={200}
        quality={40}
        src={manga.image}
        alt="Advanced Search Manga Image"
        className="object-cover rounded-l-lg w-32 h-44 lg:w-40 lg:h-56"
      />
      <div className="relative py-2 flex flex-col gap-3 w-max h-44 lg:h-56">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold">{manga.name}</h2>
          <h6 className="text-xs md:text-sm">
            {manga.author.map((a) => a.name).join(', ')}
          </h6>
        </div>

        <p className="text-sm">
          <span>Chapter:</span> {manga._count.chapter}
        </p>

        <h6 className="max-sm:hidden max-w-full max-h-full overflow-y-auto md:scrollbar md:dark:scrollbar--dark">
          {manga.review}
        </h6>
      </div>
    </Link>
  );
};

export default memo(AdvancedMangaCard);
