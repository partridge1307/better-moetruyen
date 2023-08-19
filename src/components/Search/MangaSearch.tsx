import type { Manga, MangaAuthor } from '@prisma/client';
import { DialogClose } from '@radix-ui/react-dialog';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface MangaSearchProps {
  mangas?: (Pick<Manga, 'id' | 'image' | 'name' | 'review'> & {
    author: Pick<MangaAuthor, 'name'>[];
  })[];
}

const MangaSearch: FC<MangaSearchProps> = ({ mangas }) => {
  return !!mangas?.length ? (
    <div className="space-y-7">
      {mangas.map((manga, idx) => (
        <Link
          key={idx}
          href={`/manga/${manga.id}/${manga.name.split(' ').join('-')}`}
        >
          <DialogClose className="grid grid-cols-[.4fr_1fr] lg:grid-cols-[.15fr_1fr] gap-4 p-2 rounded-md text-start transition-colors duration-100 hover:dark:bg-zinc-800">
            <div className="relative h-24">
              <Image
                fill
                sizes="(max-width: 640px) 25vw, 35vw"
                quality={40}
                src={manga.image}
                alt={`${manga.name} Thumbnail`}
                className="object-cover object-top rounded-md"
              />
            </div>

            <div>
              <h1 className="text-lg font-semibold">{manga.name}</h1>
              <p className="mb-2">
                {manga.author.map((a) => a.name).join(', ')}
              </p>
              <p className="text-sm line-clamp-3">{manga.review}</p>
            </div>
          </DialogClose>
        </Link>
      ))}
    </div>
  ) : (
    <p>Không có kết quả</p>
  );
};

export default MangaSearch;
