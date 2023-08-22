'use client';

import { useComments } from '@/hooks/use-comment';
import { useIntersection } from '@mantine/hooks';
import type { Chapter, Comment, CommentVote, User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useRef } from 'react';
import CommentInput from '../components/CommentInput';
import RefetchButton from '../components/RefetchButton';
import CommentCard from './CommentCard';

const CALLBACK_URL = '/api/comment/manga';

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
  id: number;
}

const Comments: FC<CommentOutputProps> = ({ id }) => {
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
  } = useComments<ExtendedComment>(id, CALLBACK_URL);

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const comments = CommentData?.pages.flatMap((page) => page);

  return (
    <>
      <CommentInput
        isLoggedIn={!!session}
        id={id}
        type="COMMENT"
        callbackURL="/api/comment/manga"
      />

      <RefetchButton refetch={() => refetch()} isRefetching={isRefetching} />

      <ul className="space-y-10">
        {!!comments?.length ? (
          comments.map((comment, idx) => {
            if (idx === comments.length - 1) {
              return (
                <li key={idx} ref={ref} className="flex gap-3 md:gap-6">
                  <CommentCard
                    comment={comment}
                    userId={session?.user.id}
                    callbackURL={CALLBACK_URL}
                  />
                </li>
              );
            } else {
              return (
                <li key={idx} className="flex gap-3 md:gap-6">
                  <CommentCard
                    comment={comment}
                    userId={session?.user.id}
                    callbackURL={CALLBACK_URL}
                  />
                </li>
              );
            }
          })
        ) : (
          <li className="text-center">
            Hãy làm người đầu tiên <span className="font-bold">comment</span>{' '}
            nào
          </li>
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

export default Comments;
