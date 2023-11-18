import { formatTimeToNow, nFormatter } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import { FC } from 'react';
import UserAvatar from '../User/UserAvatar';
import Username from '../User/Username';
import type { TPost } from './LastActivityPostForum';

interface PostForumCardProps {
  post: TPost;
}

const PostForumCard: FC<PostForumCardProps> = ({ post }) => {
  return (
    <a
      target="_blank"
      href={`${process.env.NEXT_PUBLIC_FORUM_URL}/m/${post.subForum.slug}/${post.id}`}
      className="block p-2 space-y-3.5 rounded-md transition-colors bg-background/30 hover:bg-background/50"
    >
      <div className="flex items-start gap-3">
        <UserAvatar user={post.author} className="w-14 h-14 bg-background" />
        <div className="space-y-1">
          <Username user={post.author} className="text-start" />
          <div className="flex items-center gap-2 text-xs opacity-80">
            <time dateTime={post.createdAt.toDateString()} className="shrink-0">
              {formatTimeToNow(post.createdAt)}
            </time>
            <span>•</span>
            <dd className="flex items-center gap-1">
              {nFormatter(post._count.comments, 1)}
              <MessageSquare className="w-4 h-4" />
            </dd>
          </div>
          <p className="line-clamp-1 text-xs opacity-80">
            {post.subForum.title}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-2xl font-semibold line-clamp-1">{post.title}</p>
        <p className="break-words line-clamp-3">{post.plainTextContent}</p>
      </div>
    </a>
  );
};

export default PostForumCard;
