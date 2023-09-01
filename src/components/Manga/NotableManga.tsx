'use client';

import { Carousel } from '@mantine/carousel';
import { createStyles, getStylesRef, rem } from '@mantine/core';
import type { Manga, MangaAuthor, Tag } from '@prisma/client';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { FC, useRef } from 'react';
import { AspectRatio } from '../ui/AspectRatio';
import { TagContent, TagWrapper } from '../ui/Tag';
import Link from 'next/link';

interface NotableMangaProps {
  mangas: (Pick<Manga, 'id' | 'slug' | 'image' | 'name'> & {
    author: Pick<MangaAuthor, 'name'>[];
    tags: Pick<Tag, 'name' | 'description'>[];
  })[];
}

const useStyles = createStyles(() => ({
  controls: {
    ref: getStylesRef('controls'),
    transition: 'opacity 150ms ease',
    top: 'auto',
    bottom: rem(1),
    justifyContent: 'end',
    '@media (min-width: 1024px)': {
      opacity: 0,
      gap: rem(20),
    },
  },
  control: {
    ref: getStylesRef('control'),
    border: 'none',
  },

  indicator: {
    ref: getStylesRef('indicator'),
    'html.dark &': {
      backgroundColor: 'white !important',
    },
  },

  root: {
    '&:hover': {
      [`& .${getStylesRef('controls')}`]: {
        opacity: 1,
      },
    },
  },
}));

const NotableManga: FC<NotableMangaProps> = ({ mangas }) => {
  const autoplay = useRef(Autoplay({ delay: 5000 }));
  const { classes } = useStyles();

  return (
    !!mangas.length && (
      <Carousel
        loop
        withIndicators
        plugins={[autoplay.current]}
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={autoplay.current.reset}
        classNames={classes}
        breakpoints={[
          { maxWidth: 'sm', slideSize: '100%', slideGap: 'md' },
          { minWidth: 'lg', slideSize: '100%', slideGap: 'xl' },
        ]}
        styles={{
          indicator: {
            width: rem(8),
            height: rem(8),
            transition: 'width 250ms ease',
            '&[data-active]': {
              width: rem(40),
            },
          },
          control: {
            '&[data-inactive]': {
              opacity: 0,
              cursor: 'default',
            },
          },
        }}
        nextControlIcon={
          <ChevronRight className="dark:text-white w-12 h-12 max-sm:hidden" />
        }
        previousControlIcon={
          <ChevronLeft className="dark:text-white w-12 h-12 max-sm:hidden" />
        }
      >
        {mangas.map((manga) => (
          <Carousel.Slide key={manga.id}>
            <Link scroll={false} href={`/manga/${manga.slug}`}>
              <div className="grid grid-cols-1 lg:grid-cols-[.3fr_1fr] gap-2 lg:gap-4 rounded-md p-2 max-sm:pb-10 dark:bg-zinc-900">
                <AspectRatio ratio={4 / 3}>
                  <Image
                    fill
                    sizes="(max-width: 640px) 50vw, 30vw"
                    quality={40}
                    priority
                    src={manga.image}
                    alt={`${manga.name} Thumbnail`}
                    className="object-cover rounded-md"
                  />
                </AspectRatio>
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
              </div>
            </Link>
          </Carousel.Slide>
        ))}
      </Carousel>
    )
  );
};

export default NotableManga;
