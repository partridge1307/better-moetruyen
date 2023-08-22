'use client';

import type { VoteType } from '@prisma/client';
import { MessageSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FC, useState } from 'react';
import { Button } from '../../ui/Button';
import CommentInput from './CommentInput';
import CommentVote from './CommentVote';

const DeleteComment = dynamic(() => import('./DeleteComment'), { ssr: false });

interface CommentFuncProps {
  id: number;
  isAuthor: boolean;
  voteAmt: number;
  currentVote?: VoteType | null;
  callbackURL: string;
  showCommentInput?: boolean;
}

const CommentFunc: FC<CommentFuncProps> = ({
  id,
  isAuthor,
  voteAmt,
  currentVote,
  callbackURL,
  showCommentInput = true,
}) => {
  const [showEditor, setShowEditor] = useState<boolean>(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <CommentVote
          commentId={id}
          callbackURL={callbackURL}
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

        {isAuthor && <DeleteComment commentId={id} />}
      </div>

      {showEditor && showCommentInput && (
        <CommentInput
          isLoggedIn
          id={id}
          type="SUB_COMMENT"
          callbackURL={`${callbackURL}/sub-comment`}
        />
      )}
    </div>
  );
};

export default CommentFunc;
