import { FC } from 'react';
import type { TForum } from './ForumInfo';
import Image from 'next/image';
import { nFormatter } from '@/lib/utils';
import { Users2 } from 'lucide-react';

interface ForumCardProps {
  forum: TForum;
}

const ForumCard: FC<ForumCardProps> = ({ forum }) => {
  return (
    <a
      target="_blank"
      href={`${process.env.NEXT_PUBLIC_FORUM_URL}/m/${forum.slug}`}
      className="grid grid-cols-[.5fr_1fr] gap-3 rounded-md transition-colors bg-primary-foreground hover:bg-primary-foreground/70"
    >
      <div className="relative aspect-video">
        {forum.banner ? (
          <Image
            fill
            sizes="(max-width: 640px) 20vw, 25vw"
            quality={40}
            src={forum.banner}
            alt={`Ảnh bìa ${forum.title}`}
            className="object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-full rounded-md bg-background" />
        )}
      </div>
      <div>
        <p className="text-xl md:text-2xl font-semibold line-clamp-1 md:line-clamp-2">
          {forum.title}
        </p>
        <dl className="flex items-center space-x-1.5">
          <dt className="font-semibold">
            {nFormatter(forum._count.subscriptions, 1)}
          </dt>
          <dd className="flex items-center gap-1 text-sm">
            <span className="max-sm:hidden">Thành viên</span>
            <Users2 className="w-5 h-5" />
          </dd>
        </dl>
      </div>
    </a>
  );
};

export default ForumCard;
