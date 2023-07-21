import { CornerDownRight } from 'lucide-react';
import { FC, useState } from 'react';
import SubCommentContent from './SubCommentOutput';
import type { Session } from 'next-auth';

interface SubCommentProps {
  subCommentLength: number;
  commentId: number;
  session: Session | null;
}

const SubComment: FC<SubCommentProps> = ({
  subCommentLength,
  commentId,
  session,
}) => {
  const [showReplies, setShowReplies] = useState<boolean>(false);

  return (
    <div>
      {showReplies ? (
        <SubCommentContent session={session} commentId={commentId} />
      ) : (
        <button
          aria-label="commentreplies"
          className="flex items-center gap-1"
          onClick={() => setShowReplies(true)}
        >
          <CornerDownRight className="w-4 h-4" />
          <span className="hover:underline underline-offset-1">
            {subCommentLength} trả lời
          </span>
        </button>
      )}
    </div>
  );
};

export default SubComment;
