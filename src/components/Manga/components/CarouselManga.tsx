'use client';

import { TagContent, TagWrapper } from '@/components/ui/Tag';
import { cn } from '@/lib/utils';
import '@/styles/mantine/globals.css';
import classes from '@/styles/mantine/manga.module.css';
import { Carousel, type Embla } from '@mantine/carousel';
import '@mantine/carousel/styles.layer.css';
import { useMediaQuery } from '@mantine/hooks';
import type { Manga, Tag } from '@prisma/client';
import Autoplay from 'embla-carousel-autoplay';
import type { EmblaCarouselType } from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import MangaImage from './MangaImage';

interface CarouselMangaProps {
  pin: {
    manga: Pick<Manga, 'id' | 'slug' | 'name' | 'image' | 'review'> & {
      tags: Pick<Tag, 'name' | 'description'>[];
    };
  }[];
}

const CarouselManga: FC<CarouselMangaProps> = ({ pin }) => {
  const autoplay = useRef(Autoplay({ delay: 5000 }));
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [embla, setEmbla] = useState<Embla | null>(null);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  const handleSlideInView = useCallback((emblaCallback: EmblaCarouselType) => {
    const currentSlide = emblaCallback.slidesInView();

    setCurrentSlideIdx(currentSlide[0] ?? 0);
  }, []);

  useEffect(() => {
    if (embla) {
      embla.on('slidesInView', handleSlideInView);
    }
  }, [embla, handleSlideInView]);

  return (
    <Carousel
      loop
      withIndicators
      plugins={[autoplay.current]}
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={autoplay.current.reset}
      getEmblaApi={setEmbla}
      classNames={classes}
      align={'center'}
      inViewThreshold={0.9}
      slideSize={{
        base: '100%',
        sm: '70%',
      }}
      previousControlIcon={
        <ChevronLeft className="w-20 h-20 rounded-full duration-75 transition-colors bg-background/30" />
      }
      nextControlIcon={
        <ChevronRight className="w-20 h-20 rounded-full duration-75 transition-colors bg-background/50" />
      }
    >
      {pin.map(({ manga }, idx) => (
        <Carousel.Slide key={manga.id}>
          <Link
            href={`/manga/${manga.slug}`}
            className={cn(
              'h-full p-2 grid grid-cols-[.5fr_1fr] md:grid-cols-[.3fr_1fr] gap-3 md:gap-6 opacity-50 transition-opacity rounded-md bg-background/50',
              {
                'opacity-100': idx === currentSlideIdx,
              }
            )}
          >
            <MangaImage priority sizes="20vw" manga={manga} />

            {!isMobile ? (
              <div className="space-y-2.5">
                <p className="text-2xl font-semibold">{manga.name}</p>

                <TagWrapper>
                  {manga.tags.slice(0, 5).map((tag, idx) => (
                    <TagContent key={idx} title={tag.description}>
                      {tag.name}
                    </TagContent>
                  ))}
                </TagWrapper>

                <p className="line-clamp-3">{manga.review}</p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <p className="text-xl line-clamp-3 font-semibold">
                    {manga.name}
                  </p>

                  <p className="line-clamp-3">{manga.review}</p>
                </div>

                <TagWrapper className="col-span-2 pb-4">
                  {manga.tags.slice(0, 5).map((tag, idx) => (
                    <TagContent key={idx} title={tag.description}>
                      {tag.name}
                    </TagContent>
                  ))}
                </TagWrapper>
              </>
            )}
          </Link>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
};

export default CarouselManga;
