import CommentVoteClient from '@/components/Comment/components/CommentVote';
import { Button } from '@/components/ui/Button';
import type { VoteType } from '@prisma/client';
import { Loader2, MessageSquare } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { FC, memo, useState } from 'react';
import DeleteComment from '../components/DeleteComment';
const MoetruyenEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditor'),
  { ssr: false, loading: () => <Loader2 className="w-6 h-6" /> }
);

interface CommentFuncProps {
  session: Session;
  authorId: string;
  mangaId: number;
  chapterId: number;
  commentId: number;
  currentVote?: VoteType | null;
  voteAmt: number;
}

const CommentFunc: FC<CommentFuncProps> = ({
  session,
  authorId,
  mangaId,
  chapterId,
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

      {showEditor && (
        <MoetruyenEditor
          id={`${mangaId}`}
          commentId={commentId}
          chapterId={chapterId}
        />
      )}
    </div>
  );
};

export default memo(CommentFunc);
