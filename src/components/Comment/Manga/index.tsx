'use client';

import { useComments } from '@/hooks/use-comment';
import { useIntersection, usePrevious } from '@mantine/hooks';
import type { Chapter, Comment, CommentVote, User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { CommentInputProps } from '../components/CommentInput';
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

const API_QUERY = '/api/comment/manga';

export type ExtendedComment = Pick<
  Comment,
  'id' | 'content' | 'oEmbed' | 'authorId' | 'createdAt'
> & {
  author: Pick<User, 'name' | 'image' | 'color'>;
  votes: CommentVote[];
  chapter: Pick<Chapter, 'id' | 'chapterIndex'> | null;
  _count: { replies: number };
};

interface CommentProps {
  id: number;
  session: Session | null;
}

const Comments = ({ id, session }: CommentProps) => {
  const lastCmtRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    threshold: 1,
    root: lastCmtRef.current,
  });
  const [comments, setComments] = useState<ExtendedComment[]>([]);
  const prevComments = usePrevious(comments);

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
          prevComment={prevComments}
          APIQuery={API_QUERY}
        />
      ) : (
        <p>
          Vui lòng <span className="font-semibold">đăng nhập</span> hoặc{' '}
          <span className="font-semibold">đăng ký</span> để bình luận
        </p>
      )}

      <ul className="space-y-10">
        {comments.map((comment, idx) => {
          if (idx === comments.length - 1)
            return (
              <li key={comment.id} ref={ref} className="flex gap-4">
                <CommentCard comment={comment} session={session}>
                  {comment.authorId === session?.user.id && (
                    <DeleteComment
                      commentId={comment.id}
                      APIQuery={`${API_QUERY}/${comment.id}`}
                      setComments={setComments}
                    />
                  )}
                </CommentCard>
              </li>
            );
          else
            return (
              <li key={comment.id} className="flex gap-4">
                <CommentCard comment={comment} session={session}>
                  {comment.authorId === session?.user.id && (
                    <DeleteComment
                      commentId={comment.id}
                      APIQuery={`${API_QUERY}/${comment.id}`}
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
