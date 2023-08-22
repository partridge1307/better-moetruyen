import { formatTimeToNow } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import type { ExtendedComment } from '.';
import UserAvatar from '../../User/UserAvatar';
import Username from '../../User/Username';
import SubComment from '../components/SubComment';
import Content from '../components/CommentContent';
import CommentOEmbed from '../components/CommentOEmbed';
import SubCommentCard from './SubCommentCard';

const CommentFunc = dynamic(() => import('../components/CommentFunc'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6" />,
});

interface CommentCardProps {
  comment: ExtendedComment;
  userId?: string;
  callbackURL: string;
}

const CommentCard = ({ comment, userId, callbackURL }: CommentCardProps) => {
  const voteAmt = comment.votes.reduce((acc, vote) => {
    if (vote.type === 'UP_VOTE') return acc + 1;
    if (vote.type === 'DOWN_VOTE') return acc - 1;
    return acc;
  }, 0);

  const currentVote = comment.votes.find((vote) => vote.userId === userId)
    ?.type;

  return (
    <>
      <UserAvatar className="mt-2 w-12 h-12" user={comment.author} />

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Username user={comment.author} />
          <p className="text-sm">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>

        <div className="space-y-2">
          <Content id={comment.id} content={comment.content} />

          {!!comment.oEmbed && (
            <CommentOEmbed
              oEmbed={
                comment.oEmbed as {
                  link: string;
                  meta: {
                    title?: string;
                    description?: string;
                    image: {
                      url?: string;
                    };
                  };
                }
              }
            />
          )}

          {!!userId && (
            <CommentFunc
              id={comment.id}
              isAuthor={comment.authorId === userId}
              voteAmt={voteAmt}
              currentVote={currentVote}
              callbackURL={callbackURL}
            />
          )}
        </div>

        {comment._count.replies !== 0 && (
          <SubComment subCommentLength={comment._count.replies}>
            <SubCommentCard
              id={comment.id}
              userId={userId}
              callbackURL={callbackURL}
            />
          </SubComment>
        )}
      </div>
    </>
  );
};

export default memo(CommentCard);
