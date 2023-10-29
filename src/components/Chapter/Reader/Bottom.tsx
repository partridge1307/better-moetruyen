'use client';

import type { DirectionType } from '@/hooks/use-direction-reader';
import type { LayoutType } from '@/hooks/use-layout-reader';
import { useViewCalc } from '@/hooks/use-view-calc';
import classes from '@/styles/chapter/bottom.module.css';
import * as Slider from '@radix-ui/react-slider';
import type { EmblaCarouselType } from 'embla-carousel-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useState,
  type FC,
} from 'react';

interface BottomProps {
  embla?: EmblaCarouselType;
  currentChapterId: number;
  commentToggle: boolean;
  menuToggle: boolean;
  layout: LayoutType;
  direction: DirectionType;
  showInfo: boolean;
  setShowInfo: Dispatch<SetStateAction<boolean>>;
}

const Bottom: FC<BottomProps> = ({
  embla,
  currentChapterId,
  commentToggle,
  menuToggle,
  layout,
  direction,
  showInfo,
  setShowInfo,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { calcView } = useViewCalc(currentChapterId);

  const [initPage, setInitPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    embla?.slideNodes().length ?? 0 - 2
  );

  useEffect(() => {
    if (!embla) return;

    const pagesLength = embla.slideNodes().length - 2;
    setTotalPages(pagesLength);

    const pageParam = searchParams.get('page');
    if (!pageParam) return;

    let page = parseInt(pageParam);
    if (layout === 'DOUBLE') {
      page = Math.floor(Math.abs(page / 2 - 1));
    }

    if (page > 0 && page <= pagesLength) {
      setInitPage(page);
    } else if (page <= 0) {
      page = 1;
      setInitPage(1);
    }
    embla.scrollTo(page, true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embla, layout]);

  const inViewHandler = useCallback(
    (emblaCb: EmblaCarouselType) => {
      const inViewSlides = emblaCb.slidesInView();
      let page = inViewSlides[inViewSlides.length - 1] ?? 1;
      if (page >= emblaCb.slideNodes().length) page--;

      setCurrentPage(page);

      page > 0 && (router.push(`?page=${page}`), calcView());
    },
    [calcView, router]
  );

  const reInitHandler = useCallback(
    (emblaCb: EmblaCarouselType) => {
      emblaCb.scrollTo(initPage, true);
    },
    [initPage]
  );

  const pointerUpHandler = useCallback((emblaCb: EmblaCarouselType) => {
    if (!emblaCb.canScrollPrev() || !emblaCb.canScrollNext()) return;

    emblaCb.internalEngine().animation.stop();
  }, []);

  const resizeHandler = useCallback(
    (emblaCb: EmblaCarouselType) => {
      emblaCb.scrollTo(currentPage, true);
    },
    [currentPage]
  );

  useEffect(() => {
    if (!embla) return;

    embla
      .on('slidesInView', inViewHandler)
      .on('pointerUp', pointerUpHandler)
      .on('reInit', reInitHandler)
      .on('resize', resizeHandler);

    return () => {
      embla
        .off('slidesInView', inViewHandler)
        .off('pointerUp', pointerUpHandler)
        .off('reInit', reInitHandler)
        .off('resize', resizeHandler);
    };
  }, [embla, inViewHandler, pointerUpHandler, reInitHandler, resizeHandler]);

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
        <div>{direction === 'ltr' ? currentPage : totalPages}</div>
        <Slider.Root
          step={layout === 'DOUBLE' ? 2 : 1}
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
        <div>{direction === 'ltr' ? totalPages : currentPage}</div>
      </div>
    </section>
  );
};

export default memo(Bottom);
