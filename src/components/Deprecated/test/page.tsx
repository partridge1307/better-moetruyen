'use client';

import classes from '@/styles/chapter/carousel.module.css';
import useEmblaCarousel, { EmblaCarouselType } from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

const dummyImages = (length: number) => {
  return Array.from(Array(length).keys()).map(
    (_, idx) => `https://picsum.photos/seed/${idx + 1}/1200`
  );
};

const Page = () => {
  const [axis, setAxis] = useState<'x' | 'y'>('x');
  const [dragFree, setDragFree] = useState(false);
  const [slidesToScroll, setSlidesToScroll] = useState<1 | 2>(1);
  const [toggle, setToggle] = useState(false);
  const [click, setClick] = useState(false);
  const [emblaRef, emblaAPI] = useEmblaCarousel(
    { align: 'start', axis, dragFree, slidesToScroll, inViewThreshold: 0.5 },
    [WheelGesturesPlugin()]
  );

  const inView = useCallback((cb: EmblaCarouselType) => {
    console.log(cb.slidesInView());
  }, []);

  useEffect(() => {
    if (!emblaAPI) return;

    emblaAPI.on('slidesInView', inView);
    emblaAPI.containerNode().addEventListener('click', () => {
      setClick((prev) => !prev);
    });

    return () => {
      emblaAPI.off('slidesInView', inView);
    };
  }, [emblaAPI, inView]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div>
          <p>Axis</p>
          <button
            className="py-0.5 px-4 rounded-md bg-primary text-primary-foreground"
            onClick={() => setAxis((prev) => (prev === 'x' ? 'y' : 'x'))}
          >
            {axis}
          </button>
        </div>
        <div>
          <p>Drag free</p>
          <button
            className="py-0.5 px-4 rounded-md bg-primary text-primary-foreground"
            onClick={() => setDragFree((prev) => !prev)}
          >
            {dragFree ? 'true' : 'false'}
          </button>
        </div>
        <div>
          <p>Type</p>
          <button
            className="py-0.5 px-4 rounded-md bg-primary text-primary-foreground"
            onClick={() => setSlidesToScroll((prev) => (prev === 1 ? 2 : 1))}
          >
            {slidesToScroll === 1 ? 'single' : 'double'}
          </button>
        </div>
        <div>
          <p>Toggle</p>
          <button
            className="py-0.5 px-4 rounded-md bg-primary text-primary-foreground"
            onClick={() => setToggle((prev) => !prev)}
          >
            {toggle ? 'true' : 'false'}
          </button>
        </div>
      </div>

      <div className="relative w-full h-[100dvh] overflow-hidden">
        <div
          ref={emblaRef}
          className={`${classes.mt_viewer} duration-300 transition-[width] ${
            toggle ? 'w-[calc(100%-24rem)]' : 'w-full'
          }`}
        >
          <div
            className={`${classes.mt_container} ${
              axis === 'x' ? classes.mt_horizontal : classes.mt_vertical
            }`}
          >
            {dummyImages(100).map((image, idx) => (
              <div
                key={idx}
                className={`${classes.mt_page} ${
                  slidesToScroll === 1 ? classes.mt_single : classes.mt_double
                }`}
              >
                <Image
                  fill
                  src={image}
                  alt={`Page ${idx + 1}`}
                  className="object-scale-down"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="fixed top-0 left-0 w-full h-16 group">
          <div
            className={`w-full h-full duration-300 transition-transform ${
              click ? '' : '-translate-y-full'
            } group-hover:translate-y-0 bg-white`}
          />
        </div>

        <div
          className={`absolute top-0 right-0 w-[24rem] h-full duration-300 transition-transform ${
            toggle ? 'translate-x-0' : 'translate-x-full'
          } bg-white`}
        />
      </div>
    </div>
  );
};

export default Page;
