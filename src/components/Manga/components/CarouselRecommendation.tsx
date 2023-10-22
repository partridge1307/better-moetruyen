'use client';

import classes from '@/styles/mantine/recommendation.module.css';
import { Carousel } from '@mantine/carousel';
import type { Manga } from '@prisma/client';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import Link from 'next/link';
import { FC, useRef } from 'react';
import MangaImage from './MangaImage';

interface CarouselRecommendationProps {
  mangas: Pick<Manga, 'id' | 'slug' | 'image' | 'name'>[];
}

const CarouselRecommendation: FC<CarouselRecommendationProps> = ({
  mangas,
}) => {
  const wheelGestures = useRef(WheelGesturesPlugin({ forceWheelAxis: 'y' }));

  return (
    <Carousel
      skipSnaps
      slidesToScroll={6}
      slideSize={'16.66%'}
      slideGap={'md'}
      align={'start'}
      classNames={classes}
      plugins={[wheelGestures.current]}
    >
      {mangas.map((manga) => (
        <Carousel.Slide key={manga.id}>
          <Link
            href={`/manga/${manga.slug}`}
            className="block w-24 lg:w-36 group space-y-1.5"
          >
            <MangaImage
              sizes="20vw"
              manga={manga}
              className="transition-transform group-hover:scale-105"
            />

            <p className="text-xl line-clamp-2" style={{ fontWeight: 550 }}>
              {manga.name}
            </p>
          </Link>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
};

export default CarouselRecommendation;
