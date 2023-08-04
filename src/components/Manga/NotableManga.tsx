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
import { useMediaQuery } from '@mantine/hooks';

type ExtendedManga = Pick<Manga, 'id' | 'name' | 'image'> & {
  tags: Pick<Tag, 'name' | 'description'>[];
  author: Pick<MangaAuthor, 'name'>[];
};

interface NotableMangaProps {
  mangas: ExtendedManga[];
}

const NotableManga: FC<NotableMangaProps> = ({ mangas }) => {
  const matches = useMediaQuery('(min-width: 768px)');

  return mangas.length ? (
    <ImageGallery
      items={mangas.map((manga) => ({
        original: manga.image,
        thumbnail: manga.image,
        thumbnailLoading: 'lazy',
        thumbnailClass: 'thumbnail-wrapper',
        renderItem(item) {
          return (
            <Link href={`/manga/${manga.id}`}>
              <div className="relative w-full h-72">
                <Image
                  fill
                  sizes="0%"
                  priority
                  src={item.original}
                  alt="Manga Image"
                  className="object-cover rounded-md absolute"
                />
                <div className="relative h-full w-full flex items-end px-2 md:px-10 py-8 bg-gradient-to-t dark:from-zinc-900">
                  <div className="flex max-sm:flex-col gap-1 md:items-center md:justify-between w-full">
                    <div className="text-start font-semibold">
                      <p className="text-base md:text-lg">{manga.name}</p>
                      <p className="text-sm max-sm:hidden">
                        {manga.author.map((a) => a.name).join(', ')}
                      </p>
                    </div>
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
        renderThumbInner(item) {
          return (
            <div className="relative w-16 h-10 md:w-24 md:h-16">
              <Image
                fill
                sizes="0%"
                src={item.original}
                alt="Manga Thumbnail Image"
                className="object-cover rounded-md"
              />
            </div>
          );
        },
      }))}
      lazyLoad
      autoPlay
      showPlayButton={false}
      showFullscreenButton={false}
      thumbnailPosition={matches ? 'right' : 'bottom'}
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
