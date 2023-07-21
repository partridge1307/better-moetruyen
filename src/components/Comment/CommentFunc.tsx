import { VoteType } from '@prisma/client';
import { FC, useState } from 'react';
import CommentVoteClient from '../Vote/CommentVoteClient';
import { Button } from '../ui/Button';
import { Loader2, MessageSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
const MoetruyenEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditor'),
  { ssr: false, loading: () => <Loader2 className="w-6 h-6" /> }
);

interface CommentFuncProps {
  mangaId: string;
  commentId: number;
  currentVote?: VoteType | null;
  voteAmt: number;
}

const CommentFunc: FC<CommentFuncProps> = ({
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
      </div>
      {showEditor && <MoetruyenEditor id={mangaId} commentId={commentId} />}
    </div>
  );
};

export default CommentFunc;
