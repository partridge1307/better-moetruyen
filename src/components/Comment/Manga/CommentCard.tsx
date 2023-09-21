import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { buttonVariants } from '@/components/ui/Button';
import { formatTimeToNow } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { FC, useRef } from 'react';
import { ExtendedComment } from '.';
import CommentVoteSkeleton from '@/components/Skeleton/CommentVoteSkeleton';
import CommentContent from '../components/CommentContent';
import CommentOEmbed from '../components/CommentOEmbed';
import SubCommentWrapper from '../components/SubCommentWrapper';
import Link from 'next/link';

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

const CommentCard: FC<CommentCardProps> = ({ comment, session, children }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <UserAvatar user={comment.author} />

      <div className="min-w-0 space-y-1">
        <dl className="flex flex-wrap items-center gap-2">
          <dt>
            <Username user={comment.author} className="text-start" />
          </dt>
          <dd className="text-sm flex items-center gap-2">
            <time dateTime={new Date(comment.createdAt).toDateString()}>
              {formatTimeToNow(new Date(comment.createdAt))}
            </time>

            {!!comment.chapter && (
              <Link
                href={`/chapter/${comment.chapter.id}`}
                className="dark:text-blue-400 hover:underline underline-offset-2"
              >
                <span>Chương</span> {comment.chapter.chapterIndex}
              </Link>
            )}
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
                APIQuery="/api/comment/manga"
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
