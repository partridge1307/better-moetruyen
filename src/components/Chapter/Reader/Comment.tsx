'use client';

import CommentSkeleton from '@/components/Skeleton/CommentSkeleton';
import { cn } from '@/lib/utils';
import { usePrevious } from '@mantine/hooks';
import { ChevronLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FC, memo, useContext } from 'react';
import {
  CommentToggleDispatchContext,
  CommentToggleValueContext,
  MenuToggleValueContext,
} from './Context';

const Comments = dynamic(() => import('@/components/Comment/Chapter'), {
  ssr: false,
  loading: () => <CommentSkeleton />,
});

interface CommentProps {
  chapterId: number;
}

const Comment: FC<CommentProps> = ({ chapterId }) => {
  const menuToggle = useContext(MenuToggleValueContext);
  const commentToggle = useContext(CommentToggleValueContext);
  const setCommentToggle = useContext(CommentToggleDispatchContext);
  const prevMenuToggle = usePrevious(menuToggle);

  return (
    <div
      className={cn(
        'absolute top-0 right-0 inset-y-0 w-full md:w-[24rem] z-20 transition-all duration-300 translate-x-full',
        {
          'translate-x-0': commentToggle,
          'xl:right-[24rem]': menuToggle && commentToggle,
          'z-[21]': prevMenuToggle,
        },
        'bg-primary-foreground overflow-y-auto md:border-l md:border-foreground/50 scrollbar dark:scrollbar--dark'
      )}
    >
      <div className="p-4 sticky top-0 z-10 flex justify-center bg-primary-foreground">
        <button
          tabIndex={-1}
          type="button"
          aria-label="close menu button"
          className="absolute top-1/2 -translate-y-1/2 left-4 p-1 rounded-md transition-colors hover:bg-muted"
          onClick={() => setCommentToggle((prev) => !prev)}
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <p className="text-2xl font-semibold">Bình luận</p>
      </div>

      <div className="my-4 space-y-10 px-4">
        <Comments id={chapterId} />
      </div>
    </div>
  );
};

export default memo(Comment);
