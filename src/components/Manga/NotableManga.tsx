'use client';

import '@/styles/swiper.css';
import type { Manga, MangaAuthor, Tag } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { TagContent, TagWrapper } from '../ui/Tag';
import LeftNav from './Swiper/LeftNav';
import RightNav from './Swiper/RightNav';

type ExtendedManga = Pick<Manga, 'id' | 'name' | 'image'> & {
  tags: Pick<Tag, 'name' | 'description'>[];
  author: Pick<MangaAuthor, 'name'>[];
};

interface NotableMangaProps {
  mangas: ExtendedManga[];
}

const NotableManga: FC<NotableMangaProps> = ({ mangas }) => {
  return mangas.length ? (
    <ImageGallery
      items={mangas.map((manga) => ({
        original: manga.image,
        renderItem(item) {
          return (
            <Link href={`/manga/${manga.id}`}>
              <div className="grid grid-cols-1 md:grid-cols-[.3fr_1fr] gap-4 p-2 rounded-lg dark:bg-zinc-900">
                <div className="relative w-full h-44 md:h-60 rounded-md">
                  <Image
                    fill
                    sizes="40vw"
                    quality={40}
                    src={item.original}
                    alt={`${manga.name} Thumbnail`}
                    className="object-contain object-top rounded-md"
                  />
                </div>

                <div className="text-start text-base space-y-2 pb-16 md:pb-10">
                  <h1 className="font-bold text-xl md:text-2xl">
                    {manga.name}
                  </h1>
                  <p>{manga.author.map((a) => a.name).join(', ')}</p>
                  <div className="space-y-1">
                    <h2>Thể loại</h2>
                    <TagWrapper className="max-sm:gap-1">
                      {manga.tags.map((tag, idx) => (
                        <TagContent key={idx} title={tag.description}>
                          {tag.name}
                        </TagContent>
                      ))}
                    </TagWrapper>
                  </div>
                </div>
              </div>
            </Link>
          );
        },
      }))}
      lazyLoad
      autoPlay
      showIndex
      showThumbnails={false}
      showPlayButton={false}
      showFullscreenButton={false}
      slideInterval={15000}
      renderLeftNav={(onClick, disabled) => (
        <LeftNav onClick={onClick} disabled={disabled} />
      )}
      renderRightNav={(onClick, disabled) => (
        <RightNav onClick={onClick} disabled={disabled} />
      )}
    />
  ) : null;
};

export default NotableManga;
