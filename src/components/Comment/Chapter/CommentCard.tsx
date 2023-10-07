import CommentVoteSkeleton from '@/components/Skeleton/CommentVoteSkeleton';
import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { buttonVariants } from '@/components/ui/Button';
import { formatTimeToNow } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import type { ExtendedComment } from '.';
import CommentContent from '../components/CommentContent';
import CommentOEmbed from '../components/CommentOEmbed';
import SubCommentWrapper from '../components/SubCommentWrapper';

const CommentVote = dynamic(() => import('../components/CommentVote'), {
  ssr: false,
  loading: () => <CommentVoteSkeleton />,
});
const SubComment = dynamic(() => import('./SubComment'), { ssr: false });

interface CommentCardProps {
  comment: ExtendedComment;
  session: Session | null;
  children: React.ReactNode;
}

const CommentCard = ({ comment, session, children }: CommentCardProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <UserAvatar user={comment.author} />

      <div className="min-w-0 space-y-1 flex-1">
        <dl className="flex flex-wrap items-center gap-2">
          <dt>
            <Username user={comment.author} className="text-start" />
          </dt>
          <dd className="text-sm">
            <time dateTime={new Date(comment.createdAt).toDateString()}>
              {formatTimeToNow(new Date(comment.createdAt))}
            </time>
          </dd>
        </dl>

        <div className="space-y-2">
          <CommentContent id={comment.id} content={comment.content} />

          {!!comment.oEmbed && <CommentOEmbed oEmbed={comment.oEmbed} />}

          {!!session && (
            <div className="flex items-center gap-4">
              <CommentVote
                commentId={comment.id}
                votes={comment.votes}
                sessionUserId={session.user.id}
                APIQuery="/api/comment"
                isSending={comment.isSending}
              />

              <button
                aria-label="comment button"
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                onClick={() => buttonRef.current?.click()}
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              {children}
            </div>
          )}

          <SubCommentWrapper
            ref={buttonRef}
            subCommentLength={comment._count.replies}
          >
            <SubComment commentId={comment.id} session={session} />
          </SubCommentWrapper>
        </div>
      </div>
    </>
  );
};

export default CommentCard;
