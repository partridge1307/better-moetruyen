'use client';

import type { Comment, User } from '@prisma/client';
import { FC } from 'react';
import CommentContent from './CommentContent';
import Link from 'next/link';
import UserAvatar from '../User/UserAvatar';
import Username from '../User/Username';
import { formatTimeToNow } from '@/lib/utils';

interface LatestCommentProps {
  comments: (Pick<Comment, 'mangaId' | 'content' | 'createdAt'> & {
    author: Pick<User, 'id' | 'color' | 'image' | 'name'>;
  })[];
}

const LatestComment: FC<LatestCommentProps> = ({ comments }) => {
  return (
    <ul className="space-y-4 p-4 rounded-lg dark:bg-zinc-900/70">
      {comments.map((comment, idx) => (
        <li key={idx} className="flex gap-2 md:gap-4">
          <Link href={`/user/${comment.author.id}`}>
            <UserAvatar
              user={comment.author}
              className="mt-2 w-10 h-10 md:w-12 md:h-12"
            />
          </Link>

          <div className="space-y-1">
            <Link href={`/user/${comment.author.id}`}>
              <Username
                user={comment.author}
                className="max-sm:text-sm text-start"
              />
              <p className="text-xs">
                {formatTimeToNow(new Date(comment.createdAt))}
              </p>
            </Link>
            <Link href={`/manga/${comment.mangaId}`}>
              <CommentContent index={idx} content={comment.content} />
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default LatestComment;
