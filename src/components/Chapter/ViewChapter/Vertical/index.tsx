import { cn } from '@/lib/utils';
import { useIntersection } from '@mantine/hooks';
import type { Chapter } from '@prisma/client';
import { MessagesSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FC, useCallback, useContext, useEffect, useRef } from 'react';
import { CurrentPageContext, ImageContext, SizeContext } from '..';
import Navigation from '../Navigation';

const Comments = dynamic(() => import('@/components/Comment/Chapter'), {
  ssr: false,
});

interface VeritcalViewChapterProps {
  chapter: Pick<Chapter, 'id' | 'chapterIndex' | 'images' | 'blurImages'>;
  chapterList: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'>[];
}

const VeritcalViewChapter: FC<VeritcalViewChapterProps> = ({
  chapter,
  chapterList,
}) => {
  const { size } = useContext(SizeContext);
  const { onPageChange } = useContext(CurrentPageContext);
  const { images, setImages } = useContext(ImageContext);
  const anchorRef = useRef<HTMLImageElement>(null);
  const { ref, entry } = useIntersection({
    root: anchorRef.current,
    threshold: 0.2,
  });

  const setImage = useCallback(
    (e: HTMLImageElement | null, idx: number) => {
      if (e) {
        images[idx] = e;
        setImages(images);
      }
    },
    [images, setImages]
  );

  const callback: IntersectionObserverCallback = useCallback(
    (entries) => {
      const intersectingEntries = entries.filter(
        (entry) => entry.isIntersecting
      );

      if (intersectingEntries.length) {
        const current = images.indexOf(
          intersectingEntries[intersectingEntries.length - 1]
            .target as HTMLImageElement
        );
        const navigationIntersecting = intersectingEntries.filter(
          (entry) => entry.target.id
        );

        if (navigationIntersecting.length) {
          onPageChange(-1);
          return;
        }

        current !== -1 && onPageChange(current);
      }
    },
    [images, onPageChange]
  );

  useEffect(() => {
    if (
      entry?.isIntersecting &&
      'startPage' in sessionStorage &&
      Date.now() - parseInt(sessionStorage.getItem('startPage')!) > 30 * 1000
    ) {
      sessionStorage.removeItem('startPage');
      fetch(`/api/chapter`, {
        method: 'POST',
        body: JSON.stringify({ id: chapter.id }),
      });
    }
  }, [chapter.id, entry?.isIntersecting]);

  useEffect(() => {
    images.find(Boolean)?.scrollIntoView({ behavior: 'smooth' });
  }, [images]);

  useEffect(() => {
    const observer = new IntersectionObserver(callback, {
      threshold: 0.2,
    });

    if (images.length) {
      images.forEach((e) => {
        observer.observe(e);
      });

      const target = document.getElementById(
        'navigation-section'
      ) as HTMLDivElement;
      observer.observe(target);
    }

    return () => {
      observer.disconnect();
    };
  }, [callback, images, size]);

  return (
    <div className="space-y-6">
      {chapter.images.map((image, idx) => {
        if (idx === Math.floor(chapter.images.length * 0.7))
          return (
            <Image
              ref={(e) => {
                ref(e);
                setImage(e, idx);
              }}
              key={idx}
              width={0}
              height={0}
              sizes="100vw"
              priority
              src={image}
              alt={`Trang ${idx + 1}`}
              placeholder="blur"
              blurDataURL={chapter.blurImages[idx]}
              className={cn('block w-fit h-auto mx-auto', {
                'w-full': size === 'FITWIDTH',
                'w-full h-fit lg:h-screen object-scale-down':
                  size === 'FITHEIGHT',
              })}
            />
          );
        else
          return (
            <Image
              ref={(e) => setImage(e, idx)}
              key={idx}
              width={0}
              height={0}
              sizes="100vw"
              priority
              src={image}
              placeholder="blur"
              blurDataURL={chapter.blurImages[idx]}
              alt={`Trang ${idx + 1}`}
              className={cn('block w-fit h-auto mx-auto', {
                'w-full': size === 'FITWIDTH',
                'w-full h-fit lg:h-screen object-scale-down':
                  size === 'FITHEIGHT',
              })}
            />
          );
      })}

      <div
        id="navigation-section"
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between max-sm:gap-4 pt-10"
      >
        <Navigation
          currentChapterIdx={chapter.chapterIndex}
          chapterList={chapterList}
        />
      </div>

      <div className="py-10 space-y-10">
        <h1 className="flex items-end gap-2 text-lg lg:text-xl font-semibold">
          <span>Bình luận</span>
          <MessagesSquare className="w-5 h-5" />
        </h1>
        <Comments id={chapter.id} />
      </div>
    </div>
  );
};

export default VeritcalViewChapter;
