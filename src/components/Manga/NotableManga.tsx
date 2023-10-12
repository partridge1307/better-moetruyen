'use client';

import '@/styles/mantine/globals.css';
import classes from '@/styles/mantine/manga.module.css';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.layer.css';
import type { Manga, MangaAuthor, Tag } from '@prisma/client';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useRef } from 'react';
import { TagContent, TagWrapper } from '../ui/Tag';

interface NotableMangaProps {
  pin: {
    manga: Pick<Manga, 'id' | 'slug' | 'name' | 'image'> & {
      author: Pick<MangaAuthor, 'name'>[];
      tags: Pick<Tag, 'name' | 'description'>[];
    };
  }[];
}

const NotableManga: FC<NotableMangaProps> = ({ pin }) => {
  const autoplay = useRef(Autoplay({ delay: 5000 }));

  return (
    <Carousel
      loop
      withIndicators
      plugins={[autoplay.current]}
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={autoplay.current.reset}
      slideGap={{
        sm: 'md',
        lg: 'xl',
      }}
      classNames={classes}
      nextControlIcon={<ChevronRight className="dark:text-white w-12 h-12" />}
      previousControlIcon={
        <ChevronLeft className="dark:text-white w-12 h-12" />
      }
    >
      {pin.map(({ manga }) => (
        <Carousel.Slide key={manga.id}>
          <Link
            scroll={false}
            href={`/manga/${manga.slug}`}
            className="h-full grid grid-cols-1 md:grid-cols-[.3fr_1fr] gap-2 lg:gap-4 rounded-md p-2 max-sm:pb-10 dark:bg-zinc-900"
          >
            <div className="relative" style={{ aspectRatio: 4 / 3 }}>
              <Image
                fill
                sizes="30vw"
                quality={40}
                priority
                src={manga.image}
                alt={`${manga.name} Thumbnail`}
                className="object-cover rounded-md"
              />
            </div>
            <div className="space-y-1 lg:space-y-2">
              <h1 className="font-semibold text-lg lg:text-xl line-clamp-2">
                {manga.name}
              </h1>

              <p>{manga.author.map((author) => author.name).join(', ')}</p>

              <TagWrapper>
                {manga.tags.slice(0, 5).map((tag, idx) => (
                  <TagContent key={idx} title={tag.description}>
                    {tag.name}
                  </TagContent>
                ))}
                {manga.tags.length > 5 && (
                  <TagContent>+{manga.tags.length - 5}</TagContent>
                )}
              </TagWrapper>
            </div>
          </Link>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
};

export default NotableManga;
