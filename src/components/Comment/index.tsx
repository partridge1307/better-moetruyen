'use client';

import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useIntersection } from '@mantine/hooks';
import type { Chapter, Comment, CommentVote, User } from '@prisma/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';
import CommentCard from './CommentCard';
import { useSession } from 'next-auth/react';

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
}

const CommentOutput: FC<CommentOutputProps> = ({ id }) => {
  const lastCmtRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    threshold: 1,
    root: lastCmtRef.current,
  });
  const { data: session } = useSession();

  const {
    data: CommentData,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['comment-infinite-query'],
    async ({ pageParam = 1 }) => {
      const query = `/api/manga/${id}/comment/?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}`;

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
    <ul className="mt-20 space-y-10">
      {comments && comments.length ? (
        comments.map((comment, idx) => {
          if (idx === comments.length - 1) {
            return (
              <li key={idx} ref={ref} className="flex gap-3 md:gap-6">
                <CommentCard
                  comment={comment}
                  index={idx}
                  id={id}
                  session={session}
                />
              </li>
            );
          } else {
            return (
              <li key={idx} className="flex gap-3 md:gap-6">
                <CommentCard
                  comment={comment}
                  index={idx}
                  id={id}
                  session={session}
                />
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
  );
};

export default CommentOutput;
