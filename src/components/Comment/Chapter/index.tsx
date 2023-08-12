'use client';

import { buttonVariants } from '@/components/ui/Button';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { cn } from '@/lib/utils';
import { useIntersection } from '@mantine/hooks';
import type { Comment, CommentVote, User } from '@prisma/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { FC, Suspense, lazy, useEffect, useRef } from 'react';
import ChapterCommentCard from './ChapterCommentCard';
const MoetruyenEditor = lazy(
  () => import('@/components/Editor/MoetruyenEditor')
);

interface CommentOutputProps {
  chapterId: number;
  mangaId: number;
}

export type ExtendedComment = Pick<
  Comment,
  'id' | 'content' | 'oEmbed' | 'authorId' | 'createdAt'
> & {
  author: Pick<User, 'name' | 'image' | 'color'>;
  votes: CommentVote[];
  _count: { replies: number };
};

const CommentOutput: FC<CommentOutputProps> = ({ chapterId, mangaId }) => {
  const { data: session } = useSession();
  const commentRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: commentRef.current,
    threshold: 1,
  });

  const {
    data: CommentData,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery(
    ['comment-infinite-query', `${chapterId}`],
    async ({ pageParam = 1 }) => {
      const query = `/api/chapter/${chapterId}/comment/?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}`;

      const { data } = await axios.get(query);
      return data as ExtendedComment[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
    }
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const comments = CommentData?.pages.flatMap((page) => page);

  return (
    <>
      {session ? (
        <Suspense
          fallback={
            <div className="h-44 w-full md:w-[600px] lg:w-[900px] rounded-lg mx-auto dark:bg-zinc-900 animate-pulse" />
          }
        >
          <MoetruyenEditor id={`${mangaId}`} chapterId={chapterId} />
        </Suspense>
      ) : (
        <div>
          Vui lòng <span className="font-semibold">đăng nhập</span> hoặc{' '}
          <span className="font-semibold">đăng ký</span> để comment
        </div>
      )}

      <div className="mt-20 mb-10 flex justify-end">
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className={cn(buttonVariants(), 'flex items-center gap-1')}
        >
          {isRefetching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tải
            </>
          ) : (
            <>
              <RefreshCcw className="w-5 h-5" />
              Làm mới
            </>
          )}
        </button>
      </div>
      <ul className="space-y-10">
        {comments && comments.length ? (
          comments.map((comment, idx) => {
            if (idx === comments.length - 1) {
              return (
                <li key={idx} ref={ref} className="flex gap-3 md:gap-6">
                  <ChapterCommentCard
                    session={session}
                    chapterId={chapterId}
                    mangaId={mangaId}
                    comment={comment}
                  />
                </li>
              );
            } else {
              return (
                <li key={idx} className="flex gap-3 md:gap-6">
                  <ChapterCommentCard
                    session={session}
                    chapterId={chapterId}
                    mangaId={mangaId}
                    comment={comment}
                  />
                </li>
              );
            }
          })
        ) : (
          <p className="text-center">
            Hãy làm người đầu tiên <span className="font-bold">comment</span>{' '}
            Chapter này nào
          </p>
        )}

        {isFetchingNextPage && (
          <li className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </li>
        )}
      </ul>
    </>
  );
};

export default CommentOutput;
