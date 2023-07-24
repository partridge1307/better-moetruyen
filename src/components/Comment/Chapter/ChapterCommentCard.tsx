import UserAvatar from '@/components/User/UserAvatar';
import { formatTimeToNow } from '@/lib/utils';
import { FC } from 'react';
import CommentContent from '../CommentContent';
import CommentOEmbed from '../CommentOEmbed';
import CommentFunc from './CommentFunc';
import SubComment from '../SubComment';
import { ExtendedComment } from '.';
import type { Prisma } from '@prisma/client';
import type { Session } from 'next-auth';

interface ChapterCommentCardProps {
  comment: ExtendedComment;
  index: number;
  session: Session | null;
  chapterId: number;
  mangaId: number;
}

const ChapterCommentCard: FC<ChapterCommentCardProps> = ({
  comment,
  index,
  session,
  chapterId,
  mangaId,
}) => {
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
            mangaId={mangaId}
            chapterId={chapterId}
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

export default ChapterCommentCard;
