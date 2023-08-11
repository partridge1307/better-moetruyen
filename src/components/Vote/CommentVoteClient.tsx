'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CommentVotePayload } from '@/lib/validators/vote';
import { usePrevious } from '@mantine/hooks';
import { VoteType } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Heart, HeartOff } from 'lucide-react';
import { FC, memo, useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { socket } from '@/lib/socket';

interface CommentVoteClientProps {
  commentId: number;
  currentVote?: VoteType | null;
  voteAmt: number;
}

const CommentVoteClient: FC<CommentVoteClientProps> = ({
  commentId,
  currentVote: initialVote,
  voteAmt: initialVoteAmt,
}) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const [voteAmt, setVoteAmt] = useState<number>(initialVoteAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);

  const { mutate: Vote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: CommentVotePayload = {
        voteType: type,
        commentId,
      };

      await axios.patch(`/api/comment/vote`, payload);
    },
    onError: (err, voteType) => {
      if (voteType === 'UP_VOTE') setVoteAmt((prev) => prev - 1);
      else setVoteAmt((prev) => prev + 1);

      setCurrentVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
        variant: 'destructive',
      });
    },
    onMutate: (type: VoteType) => {
      if (currentVote === type) {
        setCurrentVote(undefined);
        if (type === 'UP_VOTE') setVoteAmt((prev) => prev - 1);
        else if (type === 'DOWN_VOTE') setVoteAmt((prev) => prev + 1);
      } else {
        setCurrentVote(type);
        if (type === 'UP_VOTE') {
          setVoteAmt((prev) => prev + (currentVote ? 2 : 1));
          socket.emit('notify', { type: 'LIKE', payload: commentId });
        } else if (type === 'DOWN_VOTE')
          setVoteAmt((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });

  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={() => Vote('UP_VOTE')}
        variant={'ghost'}
        size={'sm'}
        aria-label="like"
        className={cn('transition-colors', {
          'text-red-500 hover:text-red-500': currentVote === 'UP_VOTE',
        })}
      >
        <Heart className="w-5 h-5" />
      </Button>

      <p>{voteAmt}</p>

      <Button
        onClick={() => Vote('DOWN_VOTE')}
        variant={'ghost'}
        size={'sm'}
        aria-label="dislike"
        className={cn('transition-colors', {
          'text-red-500 hover:text-red-500': currentVote === 'DOWN_VOTE',
        })}
      >
        <HeartOff className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default memo(CommentVoteClient);
