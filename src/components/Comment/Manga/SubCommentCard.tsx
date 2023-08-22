'use client';

import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { useSubComments } from '@/hooks/use-sub-comment';
import { formatTimeToNow } from '@/lib/utils';
import type { Comment, CommentVote, User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { FC } from 'react';
import CommentContent from '../components/CommentContent';
import CommentOEmbed from '../components/CommentOEmbed';
import dynamic from 'next/dynamic';

const CommentFunc = dynamic(() => import('../components/CommentFunc'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6" />,
});

type ExtendedSubComment = Pick<
  Comment,
  'id' | 'content' | 'oEmbed' | 'authorId' | 'createdAt'
> & {
  author: Pick<User, 'name' | 'image' | 'color'>;
  votes: CommentVote[];
};

interface SubCommentCardProps {
  id: number;
  userId?: string;
  callbackURL: string;
}

const SubCommentCard: FC<SubCommentCardProps> = ({
  id,
  userId,
  callbackURL,
}) => {
  const { data: subComment, isLoading: isFetchingSubComment } =
    useSubComments<ExtendedSubComment>(id, callbackURL);

  return isFetchingSubComment ? (
    <p>
      <Loader2 className="w-6 h-6 animate-spin" />
    </p>
  ) : (
    !!subComment?.length && (
      <ul className="mt-8 space-y-6">
        {subComment.map((comment, idx) => {
          const voteAmt = comment.votes.reduce((acc, vote) => {
            if (vote.type === 'UP_VOTE') return acc + 1;
            if (vote.type === 'DOWN_VOTE') return acc - 1;
            return acc;
          }, 0);

          const currentVote = comment.votes.find(
            (vote) => vote.userId === userId
          )?.type;

          return (
            <li key={idx} className="flex gap-3 md:gap-6">
              <UserAvatar user={comment.author} />

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Username user={comment.author} />
                  <p className="text-sm">
                    {formatTimeToNow(new Date(comment.createdAt))}
                  </p>
                </div>

                <div className="space-y-2">
                  <CommentContent id={comment.id} content={comment.content} />

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
                      showCommentInput={false}
                    />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    )
  );
};

export default SubCommentCard;
