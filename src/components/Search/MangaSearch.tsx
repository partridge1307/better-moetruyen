import type { Manga } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';
import MangaImage from '../Manga/components/MangaImage';
import { SheetClose } from '../ui/Sheet';

interface MangaSearchProps {
  mangas?: Pick<Manga, 'id' | 'slug' | 'image' | 'name' | 'review'>[];
}

const MangaSearch: FC<MangaSearchProps> = ({ mangas }) => {
  return !!mangas?.length ? (
    <div className="grid md:grid-cols-2 gap-4">
      {mangas.map((manga) => (
        <Link key={manga.id} href={`/manga/${manga.slug}`}>
          <SheetClose className="w-full text-start grid grid-cols-[.5fr_1fr] lg:grid-cols-[.2fr_1fr] gap-4 p-2 rounded-md transition-colors hover:bg-muted">
            <MangaImage manga={manga} sizes="(max-width: 640px) 15vw, 10vw" />

            <div className="space-y-0.5">
              <p className="text-2xl lg:text-3xl font-semibold">{manga.name}</p>
              <p className="line-clamp-2">{manga.review}</p>
            </div>
          </SheetClose>
        </Link>
      ))}
    </div>
  ) : (
    <p>Không có kết quả</p>
  );
};

export default MangaSearch;
