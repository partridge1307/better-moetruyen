import type { Manga, MangaAuthor } from '@prisma/client';
import { DialogClose } from '@radix-ui/react-dialog';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { AspectRatio } from '../ui/AspectRatio';

interface MangaSearchProps {
  mangas?: (Pick<Manga, 'id' | 'slug' | 'image' | 'name' | 'review'> & {
    author: Pick<MangaAuthor, 'name'>[];
  })[];
}

const MangaSearch: FC<MangaSearchProps> = ({ mangas }) => {
  return !!mangas?.length ? (
    <div className="space-y-4">
      {mangas.map((manga) => (
        <Link key={manga.id} href={`/manga/${manga.slug}}`}>
          <DialogClose className="w-full text-start grid grid-cols-[.5fr_1fr] lg:grid-cols-[.1fr_1fr] gap-4 p-2 rounded-md transition-colors hover:dark:bg-zinc-800">
            <div>
              <AspectRatio ratio={4 / 3}>
                <Image
                  fill
                  sizes="(max-width: 640px) 25vw, 30vw"
                  quality={40}
                  src={manga.image}
                  alt={`${manga.name} Thumbnail`}
                  className="object-cover rounded-md"
                />
              </AspectRatio>
            </div>

            <div>
              <h1 className="text-lg lg:text-xl font-semibold">{manga.name}</h1>
              <p className="line-clamp-1">
                {manga.author.map((author) => author.name).join(', ')}
              </p>
              <p className="line-clamp-2">{manga.review}</p>
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
