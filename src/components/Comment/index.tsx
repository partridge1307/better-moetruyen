'use client';

import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useIntersection } from '@mantine/hooks';
import type { Chapter, Comment, CommentVote, User } from '@prisma/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { FC, Suspense, lazy, useEffect, useRef } from 'react';
import CommentCard from './CommentCard';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/Button';
const MoetruyenEditor = lazy(
  () => import('@/components/Editor/MoetruyenEditor')
);

export type ExtendedComment = Pick<
  Comment,
  'id' | 'content' | 'oEmbed' | 'authorId' | 'createdAt'
> & {
  author: Pick<User, 'name' | 'image' | 'color'>;
  votes: CommentVote[];
  chapter: Pick<Chapter, 'id' | 'chapterIndex'> | null;
  _count: { replies: number };
};

interface CommentOutputProps {
  id: string;
  initialComments: ExtendedComment[];
}

const CommentOutput: FC<CommentOutputProps> = ({ id, initialComments }) => {
  const { data: session } = useSession();

  const lastCmtRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    threshold: 1,
    root: lastCmtRef.current,
  });

  const {
    data: CommentData,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery(
    ['comment-infinite-query', `${id}`],
    async ({ pageParam = 1 }) => {
      const query = `/api/manga/${id}/comment?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}`;

      const { data } = await axios.get(query);
      return data as ExtendedComment[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: {
        pages: [initialComments],
        pageParams: [1],
      },
    }
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const comments =
    CommentData?.pages.flatMap((page) => page) ?? initialComments;

  return (
    <>
      {session ? (
        <Suspense
          fallback={
            <div className="h-44 w-full md:w-[600px] lg:w-[900px] rounded-lg mx-auto dark:bg-zinc-900 animate-pulse" />
          }
        >
          <MoetruyenEditor id={id} />
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
        {comments?.length ? (
          comments.map((comment, idx) => {
            if (idx === comments.length - 1) {
              return (
                <li key={idx} ref={ref} className="flex gap-3 md:gap-6">
                  <CommentCard comment={comment} id={id} session={session} />
                </li>
              );
            } else {
              return (
                <li key={idx} className="flex gap-3 md:gap-6">
                  <CommentCard comment={comment} id={id} session={session} />
                </li>
              );
            }
          })
        ) : (
          <p className="text-center">
            Hãy làm người đầu tiên <span className="font-bold">comment</span>{' '}
            Manga này nào
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
