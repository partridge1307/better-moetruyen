'use client';

import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { formatTimeToNow } from '@/lib/utils';
import type { VoteType } from '@prisma/client';
import { MessageSquare } from 'lucide-react';
import dynamic from 'next/dist/shared/lib/dynamic';
import { FC, memo, useRef, useState } from 'react';
import type { ExtendedPost } from '../PostFeed';
import PostVoteClient from './PostVoteClient';

const MoetruyenEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  {
    ssr: false,
  }
);
const PostShareButton = dynamic(
  () => import('@/components/Forum/components/PostShareButton'),
  { ssr: false }
);

interface PostCardProps {
  subForumSlug: string;
  post: ExtendedPost;
  voteAmt: number;
  currentVote?: VoteType;
}

const PostCard: FC<PostCardProps> = ({
  subForumSlug,
  post,
  voteAmt,
  currentVote,
}) => {
  const [postHeight, setPostHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  setTimeout(() => {
    !!contentRef.current && setPostHeight(contentRef.current.clientHeight);
  }, 100);

  return (
    <div className="p-2 rounded-md transition-colors hover:dark:bg-zinc-900">
      <a
        target="_blank"
        href={`/m/${subForumSlug}/${post.id}/${post.title
          .split(' ')
          .join('-')}`}
      >
        <div className="flex items-center gap-2">
          <UserAvatar user={post.author} className="w-6 h-6" />
          <Username user={post.author} />
          <span className="text-sm">
            {formatTimeToNow(new Date(post.createdAt))}
          </span>
        </div>

        <h1 className="text-xl font-semibold">{post.title}</h1>
        <div ref={contentRef} className="relative max-h-72 overflow-hidden">
          <MoetruyenEditorOutput id={post.id} content={post.content} />
          {!!(postHeight === 288) && (
            <div className="absolute bottom-0 inset-0 bg-gradient-to-t dark:from-zinc-900" />
          )}
        </div>
      </a>

      <div className="flex flex-wrap items-center gap-3 lg:gap-6 pt-3">
        <PostVoteClient
          postId={post.id}
          voteAmt={voteAmt}
          currentVote={currentVote}
        />
        <a
          target="_blank"
          href={`/m/${subForumSlug}/${post.id}/${post.title
            .split(' ')
            .join('-')}`}
          className="flex items-end gap-2"
        >
          <MessageSquare className="w-5 h-5" /> {post._count.comments}
        </a>
        <PostShareButton
          url={`/m/${subForumSlug}/${post.id}`}
          subForumSlug={subForumSlug}
        />
      </div>
    </div>
  );
};

export default memo(PostCard);
