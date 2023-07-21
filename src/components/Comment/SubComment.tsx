import { CornerDownRight } from 'lucide-react';
import { FC, memo, useState } from 'react';
import SubCommentOutput from './SubCommentOutput';

interface SubCommentProps {
  subCommentLength: number;
  commentId: number;
}

const SubComment: FC<SubCommentProps> = ({ subCommentLength, commentId }) => {
  const [showReplies, setShowReplies] = useState<boolean>(false);

  return (
    <div>
      {showReplies ? (
        <SubCommentOutput commentId={commentId} />
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

export default memo(SubComment);
