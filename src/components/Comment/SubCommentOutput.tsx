import { toast } from '@/hooks/use-toast';
import { formatTimeToNow } from '@/lib/utils';
import { Comment, CommentVote, User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { FC } from 'react';
import UserAvatar from '../User/UserAvatar';
import SubCommentContent from './SubCommentContent';
import CommentVoteClient from '../Vote/CommentVoteClient';
import type { Session } from 'next-auth';

interface SubCommentContentProps {
  commentId: number;
  session: Session | null;
}

type ExtendedSubComment = Comment & {
  author: Pick<User, 'name' | 'image' | 'color'>;
  votes: CommentVote[];
};

const SubCommentOutput: FC<SubCommentContentProps> = ({
  commentId,
  session,
}) => {
  const { data: subComment, isLoading: isFetchSubComment } = useQuery({
    queryKey: ['sub-comment-query'],
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
      <Loader2 className="w-6 h-6" />
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
              <div>
                <SubCommentContent index={index} content={comment.content} />
                <CommentVoteClient
                  commentId={comment.id}
                  currentVote={currentVote}
                  voteAmt={voteAmt}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  ) : null;
};

export default SubCommentOutput;
