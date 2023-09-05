import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/HoverCard';
import { cn } from '@/lib/utils';
import { useContext, useEffect, useState } from 'react';
import { CurrentPageContext, ImageContext } from '../..';

const ProgressHide = () => {
  const { currentPage } = useContext(CurrentPageContext);
  const { images } = useContext(ImageContext);
  const [imagesMounted, setImagesMounted] = useState<HTMLImageElement[]>([]);
  const [currentPageMounted, setCurrentPageMounted] = useState(0);

  useEffect(() => {
    setImagesMounted(images);
  }, [images]);

  useEffect(() => {
    setCurrentPageMounted(currentPage);
  }, [currentPage]);

  return (
    currentPageMounted >= 0 && (
      <div className="fixed bottom-0 inset-x-0 h-12 opacity-0 flex items-center gap-4 px-6 group transition-all hover:opacity-100 hover:dark:bg-zinc-900">
        <p className="hidden group-hover:block">1</p>

        <div className="relative w-full h-full flex items-center gap-2">
          {imagesMounted.map((el, idx) => (
            <HoverCard key={idx} openDelay={100} closeDelay={100}>
              <HoverCardTrigger
                aria-label={`scroll to ${idx + 1} button`}
                className={cn('w-full h-1/3 rounded-md hover:cursor-pointer', {
                  'bg-orange-500': idx <= currentPageMounted,
                  'bg-orange-300': idx > currentPageMounted,
                })}
                onClick={() => el.scrollIntoView({ behavior: 'smooth' })}
              />
              <HoverCardContent className="w-fit p-2 rounded-full dark:bg-zinc-800">
                <p>{idx + 1}</p>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>

        <p className="hidden group-hover:block">{imagesMounted.length}</p>
      </div>
    )
  );
};

export default ProgressHide;
