import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { db } from '@/lib/db';
import { nFormatter } from '@/lib/utils';
import { Bookmark, Eye, Loader2, MessageSquare, Pen } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type FC } from 'react';

const UserAvatar = dynamic(() => import('@/components/User/UserAvatar'), {
  ssr: false,
});
const UserBanner = dynamic(() => import('@/components/User/UserBanner'), {
  ssr: false,
});
const Username = dynamic(() => import('@/components/User/Username'), {
  ssr: false,
});

interface MangaSubInfoProps {
  mangaId: number;
}

const MangaSubInfo: FC<MangaSubInfoProps> = async ({ mangaId }) => {
  const manga = await db.manga.findUnique({
    where: {
      id: mangaId,
      isPublished: true,
    },
    select: {
      creator: {
        select: {
          name: true,
          color: true,
          image: true,
          banner: true,
        },
      },
      view: {
        select: {
          totalView: true,
        },
      },
      _count: {
        select: {
          followedBy: true,
          comment: true,
        },
      },
    },
  });
  if (!manga) return notFound();

  return (
    <ul className="flex flex-wrap gap-3 md:gap-4">
      <li className="max-sm:order-last">
        <Popover modal>
          <PopoverTrigger className="max-sm:text-sm p-0.5 px-2 flex items-center gap-1.5 rounded-full ring-2 ring-foreground">
            <Pen className="w-4 h-4 md:w-5 md:h-5" />
            <span className="line-clamp-1">{manga.creator.name}</span>
          </PopoverTrigger>

          <PopoverContent className="p-1.5" asChild>
            <Link
              href={`/user/${manga.creator.name?.split(' ').join('-')}`}
              className="block"
            >
              <div className="relative">
                <UserBanner user={manga.creator} />
                <UserAvatar
                  user={manga.creator}
                  className="w-14 h-14 absolute left-4 bottom-0 translate-y-1/2 bg-background ring-4 ring-secondary"
                />
              </div>

              <Username
                user={manga.creator}
                className="text-start mt-11 pl-4"
              />
            </Link>
          </PopoverContent>
        </Popover>
      </li>

      <li className="flex items-center gap-1.5">
        <Bookmark className="w-5 h-5" />
        {nFormatter(manga._count.followedBy, 1)}
      </li>

      <li className="flex items-center gap-1.5">
        <Eye className="w-5 h-5" /> {nFormatter(manga.view?.totalView!, 1)}
      </li>

      <li className="flex items-center gap-1.5">
        <MessageSquare className="w-5 h-5" />
        {nFormatter(manga._count.comment, 1)}
      </li>
    </ul>
  );
};

export default MangaSubInfo;

export const MangaSubInfoSkeleton = () => (
  <ul className="flex flex-wrap gap-3 md:gap-4">
    <li className="max-sm:order-last">
      <button
        aria-label="author info loading"
        className="p-0.5 px-2 flex items-center gap-1.5 rounded-full ring-2 ring-foreground"
      >
        <Pen className="w-4 h-4 md:w-5 md:h-5" />
        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
      </button>
    </li>

    <li className="flex items-center gap-1.5">
      <Bookmark className="w-5 h-5" />
      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
    </li>
    <li className="flex items-center gap-1.5">
      <Eye className="w-5 h-5" />
      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
    </li>
    <li className="flex items-center gap-1.5">
      <MessageSquare className="w-5 h-5" />
      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
    </li>
  </ul>
);
