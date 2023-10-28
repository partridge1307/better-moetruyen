'use client';

import CommentVoteSkeleton from '@/components/Skeleton/CommentVoteSkeleton';
import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { useSubComments } from '@/hooks/use-sub-comment';
import { cn, formatTimeToNow } from '@/lib/utils';
import { usePrevious } from '@mantine/hooks';
import type {
  Comment,
  CommentVote as CommentVoteType,
  User,
} from '@prisma/client';
import { Loader2 } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from 'react';
import CommentContent from '../components/CommentContent';
import type { CommentInputProps } from '../components/CommentInput';
import CommentOEmbed from '../components/CommentOEmbed';
import type { DeleteCommentProps } from '../components/DeleteComment';

const CommentVote = dynamic(() => import('../components/CommentVote'), {
  ssr: false,
  loading: () => <CommentVoteSkeleton />,
});
const DeleteComment = dynamic<DeleteCommentProps<ExtendedSubComment>>(
  () => import('../components/DeleteComment'),
  { ssr: false }
);
const CommentInput = dynamic<CommentInputProps<ExtendedSubComment>>(
  () => import('../components/CommentInput'),
  { ssr: false }
);

export type ExtendedSubComment = Pick<
  Comment,
  'id' | 'content' | 'oEmbed' | 'authorId' | 'createdAt'
> & {
  author: Pick<User, 'name' | 'image' | 'color'>;
  votes: CommentVoteType[];
  isSending?: boolean;
};

interface SubCommentProps {
  commentId: number;
  session: Session | null;
}

const SubComment: FC<SubCommentProps> = ({ commentId, session }) => {
  const { data: subCommentsData, isFetching } =
    useSubComments<ExtendedSubComment>(commentId);
  const [subComments, setSubComments] = useState<ExtendedSubComment[]>([]);
  const prevComments = usePrevious(subComments);

  useEffect(() => {
    if (subCommentsData?.length) {
      setSubComments(subCommentsData);
    }
  }, [subCommentsData]);

  return isFetching ? (
    <Loader2
      aria-label="loading sub comment"
      className="w-10 h-10 animate-spin"
    />
  ) : (
    <>
      <ul className="space-y-6 mb-10">
        {!!subComments.length &&
          subComments.map((subComment) => (
            <li
              key={subComment.id}
              className={cn('flex gap-4', {
                'opacity-70': subComment.isSending,
              })}
            >
              <UserAvatar user={subComment.author} />

              <div className="space-y-1">
                <dl className="flex flex-wrap items-center gap-2">
                  <dt>
                    <Username user={subComment.author} />
                  </dt>
                  <dd className="text-sm">
                    <time
                      dateTime={new Date(subComment.createdAt).toDateString()}
                    >
                      {formatTimeToNow(new Date(subComment.createdAt))}
                    </time>
                  </dd>
                </dl>

                <div className="space-y-2">
                  <CommentContent
                    commentId={subComment.id}
                    commentContent={subComment.content}
                  />

                  {!!subComment.oEmbed && (
                    <CommentOEmbed oEmbed={subComment.oEmbed} />
                  )}

                  <div className="flex items-center gap-4">
                    {!!session && (
                      <CommentVote
                        commentId={subComment.id}
                        votes={subComment.votes}
                        sessionUserId={session.user.id}
                        APIQuery="/api/comment"
                        isSending={subComment.isSending}
                      />
                    )}

                    {session?.user.id === subComment.authorId && (
                      <DeleteComment
                        commentId={subComment.id}
                        APIQuery={`/api/comment/${subComment.id}`}
                        setComments={setSubComments}
                        isSending={subComment.isSending}
                      />
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
      </ul>

      {!!session && (
        <CommentInput
          type="SUB_COMMENT"
          session={session}
          id={commentId}
          setComments={setSubComments}
          prevComment={prevComments}
          APIQuery="/api/comment/manga"
        />
      )}
    </>
  );
};

export default SubComment;
