'use client';

import { useDirectionReader } from '@/hooks/use-direction-reader';
import { useLayoutReader } from '@/hooks/use-layout-reader';
import { useNavChapter } from '@/hooks/use-nav-chapter';
import { useHotkeys, usePrevious } from '@mantine/hooks';
import type { Chapter } from '@prisma/client';
import useEmblaCarousel from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { FC, useState } from 'react';
import Bottom from './Bottom';
import Top from './Top';
import Viewer from './Viewer';
import dynamic from 'next/dynamic';

const Menu = dynamic(() => import('./Menu'), { ssr: false });
const Comment = dynamic(() => import('./Comment'), { ssr: false });

interface ReaderProps {
  currentChapterId: number;
  mangaSlug: string;
  images: string[];
  title: string;
  prevChapter: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'> | null;
  nextChapter: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'> | null;
  chapterList: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'>[];
}

useEmblaCarousel.globalOptions = {
  align: 'start',
  startIndex: 1,
};

const Reader: FC<ReaderProps> = ({
  currentChapterId,
  mangaSlug,
  images,
  title,
  prevChapter,
  nextChapter,
  chapterList,
}) => {
  const [menuToggle, setMenuToggle] = useState(false);
  const [commentToggle, setCommentToggle] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { layout, setLayout } = useLayoutReader();
  const { direction, setDirection } = useDirectionReader();
  const { isEnabled, setContinuous, goToPrev, goToNext } = useNavChapter({
    prevChapter,
    nextChapter,
    mangaSlug,
  });
  const [pressedKey, setPressedKey] = useState<
    'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null
  >(null);
  const prevPressedKey = usePrevious(pressedKey);

  const [emblaRef, embla] = useEmblaCarousel(
    {
      inViewThreshold: layout === 'VERTICAL' ? 0.1 : 0.5,
      axis: layout === 'VERTICAL' ? 'y' : 'x',
      slidesToScroll: layout === 'DOUBLE' ? 2 : 1,
      direction: direction === 'rtl' && layout !== 'VERTICAL' ? 'rtl' : 'ltr',
      dragFree: layout === 'VERTICAL',
    },
    [WheelGesturesPlugin()]
  );

  // Key binding
  useHotkeys([
    [
      'ctrl+shift+C',
      () => setCommentToggle((prev) => !prev),
      { preventDefault: true },
    ],
    ['ctrl+M', () => setMenuToggle((prev) => !prev)],
    ['ctrl+I', () => setShowInfo((prev) => !prev)],
    [
      'Home',
      () => {
        if (!embla) return;
        embla.scrollTo(0, true);
      },
      {
        preventDefault: true,
      },
    ],
    [
      'End',
      () => {
        if (!embla) return;
        embla.scrollTo(
          layout === 'DOUBLE'
            ? Math.floor(Math.abs(embla.slideNodes().length / 2 - 1))
            : embla.slideNodes().length - 2,
          true
        );
      },
      { preventDefault: true },
    ],
    [
      'ctrl+shift+{',
      () => {
        if (layout === 'SINGLE') setLayout('DOUBLE');
        else if (layout === 'DOUBLE') setLayout('VERTICAL');
        else setLayout('SINGLE');
      },
    ],
    [
      'ctrl+shift+}',
      () => {
        if (direction === 'ltr') setDirection('rtl');
        else setDirection('ltr');
      },
    ],
    ['ctrl+Y', () => setContinuous(isEnabled === 'false' ? 'true' : 'false')],
    [
      'ArrowLeft',
      (e) => {
        if (layout === 'VERTICAL') return goToPrev();

        if (
          !embla?.canScrollPrev() &&
          prevPressedKey === 'LEFT' &&
          !e.repeat &&
          isEnabled === 'true'
        ) {
          return goToPrev();
        }

        if (direction === 'ltr') {
          if (embla?.canScrollPrev()) {
            embla.scrollPrev();
          } else goToPrev();
        } else {
          if (embla?.canScrollNext()) {
            embla.scrollNext();
          } else goToNext();
        }

        setPressedKey('LEFT');
      },
    ],
    [
      'ArrowRight',
      (e) => {
        if (layout === 'VERTICAL') return goToNext();

        if (
          !embla?.canScrollNext() &&
          prevPressedKey === 'RIGHT' &&
          !e.repeat &&
          isEnabled === 'true'
        ) {
          return goToNext();
        }

        if (direction === 'ltr') {
          if (embla?.canScrollNext()) {
            embla.scrollNext();
          } else goToNext();
        } else {
          if (embla?.canScrollPrev()) {
            embla.scrollPrev();
          } else goToPrev();
        }

        setPressedKey('RIGHT');
      },
    ],
    [
      'ArrowUp',
      (e) => {
        if (layout !== 'VERTICAL') return goToPrev();

        const engine = embla?.internalEngine();
        if (!engine) return;

        const location = engine.location.get();
        const limit = engine.limit;
        const distance = location > limit.max ? location + 50 : 50;

        if (!limit.reachedMax(location + distance)) {
          engine.animation.stop();
          engine.location.add(distance);
          engine.translate.to(location + distance);
        } else if (
          prevPressedKey === 'UP' &&
          !e.repeat &&
          isEnabled === 'true'
        ) {
          return goToPrev();
        }

        setPressedKey('UP');
      },
    ],
    [
      'ArrowDown',
      (e) => {
        if (layout !== 'VERTICAL') return goToNext();

        const engine = embla?.internalEngine();
        if (!engine) return;

        const location = engine.location.get();
        const limit = engine.limit;
        const distance = location > limit.max ? location + 50 : 50;

        if (!limit.reachedMin(location - distance)) {
          engine.animation.stop();
          engine.location.subtract(distance);
          engine.translate.to(location - distance);
        } else if (
          prevPressedKey === 'DOWN' &&
          !e.repeat &&
          isEnabled === 'true'
        ) {
          return goToNext();
        }

        setPressedKey('DOWN');
      },
    ],
  ]);

  return (
    <>
      <Top
        href={`/manga/${mangaSlug}`}
        title={title}
        commentToggle={commentToggle}
        setCommentToggle={setCommentToggle}
        menuToggle={menuToggle}
        setMenuToggle={setMenuToggle}
        showInfo={showInfo}
      />

      <section className="relative w-full h-full overflow-hidden">
        <Viewer
          emblaRef={emblaRef}
          mangaSlug={mangaSlug}
          images={images}
          commentToggle={commentToggle}
          menuToggle={menuToggle}
          layout={layout}
          direction={direction}
          nextChapter={nextChapter}
        />
        <Comment
          currentChapterId={currentChapterId}
          commentToggle={commentToggle}
          setCommentToggle={setCommentToggle}
          menuToggle={menuToggle}
        />
        <Menu
          currentChapterId={currentChapterId}
          mangaSlug={mangaSlug}
          title={title}
          menuToggle={menuToggle}
          setMenuToggle={setMenuToggle}
          layout={layout}
          setLayout={setLayout}
          direction={direction}
          setDirection={setDirection}
          isContinuosEnabled={isEnabled === 'true'}
          setContinuous={setContinuous}
          prevChapterId={prevChapter?.id}
          nextChapterId={nextChapter?.id}
          chapterList={chapterList}
        />
      </section>

      <Bottom
        embla={embla}
        currentChapterId={currentChapterId}
        commentToggle={commentToggle}
        menuToggle={menuToggle}
        layout={layout}
        direction={direction}
        showInfo={showInfo}
        setShowInfo={setShowInfo}
      />
    </>
  );
};

export default Reader;
