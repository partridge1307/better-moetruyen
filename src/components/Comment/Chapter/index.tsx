'use client';

import { useComments } from '@/hooks/use-comment';
import { cn } from '@/lib/utils';
import { useIntersection } from '@mantine/hooks';
import type { Comment, CommentVote, User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { CommentInputProps } from '../components/CommentInput';
import type { DeleteCommentProps } from '../components/DeleteComment';
import CommentCard from './CommentCard';

const CommentInput = dynamic<CommentInputProps<ExtendedComment>>(
  () => import('../components/CommentInput'),
  {
    ssr: false,
  }
);
const DeleteComment = dynamic<DeleteCommentProps<ExtendedComment>>(
  () => import('../components/DeleteComment'),
  {
    ssr: false,
  }
);

const API_QUERY = '/api/comment/chapter';

export type ExtendedComment = Pick<
  Comment,
  'id' | 'content' | 'oEmbed' | 'authorId' | 'createdAt'
> & {
  author: Pick<User, 'name' | 'image' | 'color'>;
  votes: CommentVote[];
  _count: { replies: number };
  isSending?: boolean;
};

interface commentProps {
  id: number;
}

const Comments = ({ id }: commentProps) => {
  const { data: session } = useSession();

  const lastCmtRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    threshold: 1,
    root: lastCmtRef.current,
  });
  const [comments, setComments] = useState<ExtendedComment[]>([]);

  const {
    data: commentsData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useComments<ExtendedComment>(id, `${API_QUERY}/${id}`);

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, fetchNextPage, hasNextPage]);

  useEffect(() => {
    setComments(commentsData?.pages.flatMap((page) => page.comments) ?? []);
  }, [commentsData?.pages]);

  return (
    <>
      {!!session ? (
        <CommentInput
          type="COMMENT"
          id={id}
          session={session}
          setComments={setComments}
          APIQuery={API_QUERY}
        />
      ) : (
        <p>
          Vui lòng{' '}
          <Link
            href="/sign-in"
            className="text-lg font-semibold hover:underline underline-offset-2"
          >
            đăng nhập
          </Link>{' '}
          hoặc{' '}
          <Link
            href="/sign-up"
            className="text-lg font-semibold hover:underline underline-offset-2"
          >
            đăng ký
          </Link>{' '}
          để bình luận
        </p>
      )}

      <ul className="space-y-10">
        {comments.map((comment, idx) => {
          if (idx === comments.length - 1)
            return (
              <li
                key={comment.id}
                ref={ref}
                className={cn('flex gap-4', {
                  'opacity-70': comment.isSending,
                })}
              >
                <CommentCard comment={comment} session={session}>
                  {comment.authorId === session?.user.id && (
                    <DeleteComment
                      isSending={comment.isSending}
                      commentId={comment.id}
                      APIQuery={`/api/comment/${comment.id}`}
                      setComments={setComments}
                    />
                  )}
                </CommentCard>
              </li>
            );
          else
            return (
              <li
                key={comment.id}
                className={cn('flex gap-4', {
                  'opacity-70': comment.isSending,
                })}
              >
                <CommentCard comment={comment} session={session}>
                  {comment.authorId === session?.user.id && (
                    <DeleteComment
                      isSending={comment.isSending}
                      commentId={comment.id}
                      APIQuery={`/api/comment/${comment.id}`}
                      setComments={setComments}
                    />
                  )}
                </CommentCard>
              </li>
            );
        })}
      </ul>

      {isFetchingNextPage && (
        <p className="flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin" />
        </p>
      )}
    </>
  );
};

export default Comments;
