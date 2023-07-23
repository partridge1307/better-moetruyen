import { toast } from '@/hooks/use-toast';
import { formatTimeToNow } from '@/lib/utils';
import type { Comment, CommentVote, Prisma, User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { FC } from 'react';
import UserAvatar from '../User/UserAvatar';
import CommentVoteClient from '../Vote/CommentVoteClient';
import CommentOEmbed from './CommentOEmbed';
import DeleteComment from './DeleteComment';
import SubCommentContent from './SubCommentContent';

interface SubCommentContentProps {
  commentId: number;
}

type ExtendedSubComment = Pick<
  Comment,
  'id' | 'content' | 'oEmbed' | 'authorId' | 'createdAt'
> & {
  author: Pick<User, 'name' | 'image' | 'color'>;
  votes: CommentVote[];
};

const SubCommentOutput: FC<SubCommentContentProps> = ({ commentId }) => {
  const { data: session } = useSession();
  const { data: subComment, isLoading: isFetchSubComment } = useQuery({
    queryKey: [`sub-comment-query`, `${commentId}`],
    queryFn: async () => {
      const { data } = await axios.get(`/api/comment/${commentId}/sub-comment`);

      return data as ExtendedSubComment[];
    },
    onError: () => {
      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
        variant: 'destructive',
      });
    },
  });

  return isFetchSubComment ? (
    <p>
      <Loader2 className="w-6 h-6 animate-spin" />
    </p>
  ) : subComment ? (
    <ul className="mt-8 space-y-6">
      {subComment.map((comment, index) => {
        const voteAmt = comment.votes.reduce((acc, vote) => {
          if (vote.type === 'UP_VOTE') return acc + 1;
          if (vote.type === 'DOWN_VOTE') return acc - 1;
          return acc;
        }, 0);

        const currentVote = comment.votes.find(
          (vote) => vote.userId === session?.user.id
        )?.type;

        return (
          <li key={index} className="flex gap-3 md:gap-6">
            <UserAvatar className="mt-2 w-10 h-10" user={comment.author} />

            <div className="space-y-1">
              <div className="flex items-end gap-2">
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
                <SubCommentContent index={index} content={comment.content} />

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

                <div className="flex items-center gap-4">
                  <CommentVoteClient
                    commentId={comment.id}
                    currentVote={currentVote}
                    voteAmt={voteAmt}
                  />

                  <DeleteComment
                    session={session}
                    authorId={comment.authorId}
                    commentId={comment.id}
                  />
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  ) : null;
};

export default SubCommentOutput;
