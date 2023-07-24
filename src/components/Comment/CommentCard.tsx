import { formatTimeToNow } from '@/lib/utils';
import type { Prisma } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FC } from 'react';
import type { ExtendedComment } from '.';
import UserAvatar from '../User/UserAvatar';
import CommentContent from './CommentContent';
import CommentOEmbed from './CommentOEmbed';
import SubComment from './SubComment';
const CommentFunc = dynamic(() => import('./CommentFunc'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6" />,
});

interface CommentCardProps {
  comment: ExtendedComment;
  id: string;
  index: number;
  session: Session | null;
}

const CommentCard: FC<CommentCardProps> = ({ comment, id, index, session }) => {
  const voteAmt = comment.votes.reduce((acc, vote) => {
    if (vote.type === 'UP_VOTE') return acc + 1;
    if (vote.type === 'DOWN_VOTE') return acc - 1;
    return acc;
  }, 0);

  const currentVote = comment.votes.find(
    (vote) => vote.userId === session?.user.id
  )?.type;

  return (
    <>
      <UserAvatar className="mt-2 w-12 h-12" user={comment.author} />

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p
            className="text-lg"
            style={{
              color: comment.author.color ? comment.author.color : '',
            }}
          >
            {comment.author.name}
          </p>
          <p className="text-sm">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>

          {comment.chapter !== null && (
            <>
              <span>•</span>
              <Link
                href={`/chapter/${comment.chapter.id}`}
                className="text-sm text-blue-400"
              >
                Chapter {comment.chapter.chapterIndex}
              </Link>
            </>
          )}
        </div>

        <div className="space-y-2">
          <CommentContent index={index} content={comment.content} />

          <CommentOEmbed
            oEmbed={
              comment.oEmbed as
                | (Prisma.JsonValue & {
                    link: string;
                    meta: {
                      title?: string;
                      description?: string;
                      image: {
                        url?: string;
                      };
                    };
                  })
                | null
            }
          />

          <CommentFunc
            session={session}
            authorId={comment.authorId}
            mangaId={id}
            commentId={comment.id}
            currentVote={currentVote}
            voteAmt={voteAmt}
          />
        </div>

        {comment._count.replies !== 0 ? (
          <SubComment
            subCommentLength={comment._count.replies}
            commentId={comment.id}
          />
        ) : null}
      </div>
    </>
  );
};

export default CommentCard;
