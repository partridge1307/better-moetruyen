'use client';

import { useViewCalc } from '@/hooks/use-view-calc';
import classes from '@/styles/chapter/bottom.module.css';
import { useMediaQuery } from '@mantine/hooks';
import * as Slider from '@radix-ui/react-slider';
import type { EmblaCarouselType } from 'embla-carousel-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FC,
} from 'react';
import {
  CommentToggleContext,
  DirectionContext,
  InfoToggleContext,
  LayoutContext,
  MenuToggleContext,
} from './Context';

interface BottomProps {
  embla?: EmblaCarouselType;
  chapterId: number;
}

const Bottom: FC<BottomProps> = ({ embla, chapterId }) => {
  const [menuToggle] = useContext(MenuToggleContext);
  const [commentToggle] = useContext(CommentToggleContext);
  const [showInfo, setShowInfo] = useContext(InfoToggleContext);
  const { layout } = useContext(LayoutContext);
  const { direction } = useContext(DirectionContext);
  const { calcView } = useViewCalc(chapterId);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const isMobile = useMediaQuery('(max-width: 640px)');

  useEffect(() => {
    if (!embla) return;

    const totalPages =
      layout === 'DOUBLE'
        ? embla.slideNodes().length / 2
        : embla.slideNodes().length - 1;
    setTotalPages(totalPages);

    let page = parseInt(searchParams.get('page') ?? '1');
    if (layout === 'DOUBLE') {
      page = Math.floor(Math.abs(page / 2 - 1));
    } else page -= 1;

    if (page >= 0) {
      setCurrentPage(page + 1);
      embla.scrollTo(page, true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embla, layout]);

  useEffect(() => {
    router.replace(`?page=${currentPage}`, { scroll: false });
    calcView();
  }, [currentPage, router, calcView]);

  const inViewHandler = useCallback(
    (emblaCb: EmblaCarouselType) => {
      const inViewSlides = emblaCb.slidesInView();
      let page = (inViewSlides[inViewSlides.length - 1] ?? 0) + 1;
      if (page >= emblaCb.slideNodes().length) page--;

      setCurrentPage(layout === 'DOUBLE' ? Math.round(page / 2) : page);
    },
    [layout]
  );

  const pointerUpHandler = useCallback(
    (emblaCb: EmblaCarouselType) => {
      if (!emblaCb.canScrollPrev() || !emblaCb.canScrollNext()) return;

      !isMobile && emblaCb.internalEngine().animation.stop();
    },
    [isMobile]
  );

  useEffect(() => {
    if (!embla) return;

    embla.on('slidesInView', inViewHandler).on('pointerUp', pointerUpHandler);

    return () => {
      embla
        .off('slidesInView', inViewHandler)
        .off('pointerUp', pointerUpHandler);
    };
  }, [embla, inViewHandler, pointerUpHandler]);

  const onClickHandler = useCallback(
    (event: MouseEvent, containerRect: DOMRect) => {
      const { x } = event;
      const { left, right } = containerRect;
      const width = right - left;
      const leftSection = width * 0.3,
        rightSection = width * 0.7;

      if (leftSection < x && x < rightSection) {
        setShowInfo((prev) => !prev);
      }
      if (layout === 'VERTICAL') return;

      if (direction === 'ltr') {
        if (x <= leftSection && embla?.canScrollPrev()) {
          embla.scrollPrev();
        }

        if (x >= rightSection && embla?.canScrollNext()) {
          embla.scrollNext();
        }
      } else {
        if (x <= leftSection && embla?.canScrollNext()) {
          embla.scrollNext();
        }

        if (x >= rightSection && embla?.canScrollPrev()) {
          embla.scrollPrev();
        }
      }
    },
    [layout, direction, setShowInfo, embla]
  );

  useEffect(() => {
    if (!embla) return;
    const containerNode = embla.containerNode();

    containerNode.onclick = (e) =>
      onClickHandler(e, containerNode.getBoundingClientRect());
  }, [embla, onClickHandler]);

  return (
    <section
      className={`${classes.mt_bottom_wrapper} ${
        commentToggle || menuToggle ? classes.active : ''
      } ${commentToggle && menuToggle ? classes.active_both : ''}`}
    >
      <div
        className={`${classes.mt_bottom_inner} ${
          showInfo ? classes.active : ''
        }`}
      >
        <span>
          {direction === 'rtl' && layout !== 'VERTICAL'
            ? totalPages
            : currentPage}
        </span>
        <Slider.Root
          className={classes.mt_bottom_slider}
          min={1}
          max={totalPages}
          value={[currentPage]}
          onValueChange={(value) => embla?.scrollTo(value[0] - 1, true)}
          dir={direction === 'rtl' && layout !== 'VERTICAL' ? 'rtl' : 'ltr'}
        >
          <Slider.Track className={classes.mt_bottom_slider_track}>
            <Slider.Range className={classes.mt_bottom_slider_range} />
          </Slider.Track>
          <Slider.Thumb
            aria-label="volume"
            className={classes.mt_bottom_slider_thumb}
          >
            <span className={classes.mt_bottom_slider_tooltip}>
              {currentPage}
            </span>
          </Slider.Thumb>
        </Slider.Root>
        <span>
          {direction === 'rtl' && layout !== 'VERTICAL'
            ? currentPage
            : totalPages}
        </span>
      </div>
    </section>
  );
};

export default memo(Bottom);
