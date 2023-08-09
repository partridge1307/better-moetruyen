import type { VoteType } from '@prisma/client';
import { MessageSquare } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { FC, memo, useState } from 'react';
import CommentVoteClient from '../Vote/CommentVoteClient';
import { Button } from '../ui/Button';
import DeleteComment from './DeleteComment';
const MoetruyenEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-44 rounded-md dark:bg-zinc-900 animate-pulse" />
    ),
  }
);

interface CommentFuncProps {
  session: Session | null;
  authorId: string;
  mangaId: string;
  commentId: number;
  currentVote?: VoteType | null;
  voteAmt: number;
}

const CommentFunc: FC<CommentFuncProps> = ({
  session,
  authorId,
  mangaId,
  commentId,
  currentVote,
  voteAmt,
}) => {
  const [showEditor, setShowEditor] = useState<boolean>(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <CommentVoteClient
          commentId={commentId}
          currentVote={currentVote}
          voteAmt={voteAmt}
        />

        <Button
          onClick={() => setShowEditor((prev) => !prev)}
          variant={'ghost'}
          size={'sm'}
        >
          <MessageSquare className="w-5 h-5" />
        </Button>

        <DeleteComment
          session={session}
          authorId={authorId}
          commentId={commentId}
        />
      </div>
      {showEditor && <MoetruyenEditor id={mangaId} commentId={commentId} />}
    </div>
  );
};

export default memo(CommentFunc);
