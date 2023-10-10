import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FormEvent,
} from 'react';
import { CurrentPageContext, ImageContext } from '..';

const ChapterPage = () => {
  const { currentPage } = useContext(CurrentPageContext);
  const { images } = useContext(ImageContext);

  const [idx, setIdx] = useState(1);
  const [imagesMounted, setImagesMounted] = useState<HTMLImageElement[]>([]);
  const [currentPageMounted, setCurrentPageMounted] = useState(0);

  useEffect(() => {
    setImagesMounted(images);
  }, [images]);

  useEffect(() => {
    setCurrentPageMounted(currentPage);
  }, [currentPage]);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const target = images.find((_, index) => index === idx - 1);

      target?.scrollIntoView({ behavior: 'smooth' });
    },
    [idx, images]
  );

  return (
    <Popover>
      <PopoverTrigger
        aria-label="chapter page button"
        className="rounded-md p-1 dark:bg-zinc-900/60"
      >
        {currentPageMounted + 1} / {imagesMounted.length}
      </PopoverTrigger>

      <PopoverContent className="w-fit p-2 dark:bg-zinc-900">
        <form onSubmit={handleSubmit} className="inline-block">
          <input
            aria-label="scroll specific page input"
            type="number"
            min={1}
            max={imagesMounted.length}
            value={idx}
            onChange={(e) => {
              const value = e.target.valueAsNumber;

              isNaN(value) ? setIdx(0) : setIdx(value);
            }}
            className="focus:outline-none bg-transparent text-center"
          />
          <button type="submit" className="hidden" />
        </form>{' '}
        / <span className="px-2">{imagesMounted.length}</span>
      </PopoverContent>
    </Popover>
  );
};

export default memo(ChapterPage);
