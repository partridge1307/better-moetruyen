import ListChapter from '@/components/Chapter/ListChapter/ListChapter';
import ListTreeChapter from '@/components/Chapter/ListChapter/ListTreeChapter';
import DiscEmbed from '@/components/DiscEmbed';
import CommentSkeleton from '@/components/Skeleton/CommentSkeleton';
import FBEmbedSkeleton from '@/components/Skeleton/FBEmbedSkeleton';
import UserAvatar from '@/components/User/UserAvatar';
import UserBanner from '@/components/User/UserBanner';
import Username from '@/components/User/Username';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Manga } from '@prisma/client';
import { List, ListTree } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const FBEmbed = dynamic(() => import('@/components/FBEmbed'), {
  ssr: false,
  loading: () => <FBEmbedSkeleton />,
});
const Comments = dynamic(() => import('@/components/Comment/Manga'), {
  ssr: false,
  loading: () => <CommentSkeleton />,
});

interface MangaTabsProps {
  Manga: Pick<Manga, 'id'>;
}

const MangaTabs: FC<MangaTabsProps> = async ({ Manga }) => {
  const [manga, session] = await Promise.all([
    db.manga.findUnique({
      where: {
        id: Manga.id,
      },
      select: {
        facebookLink: true,
        discordLink: true,
        creator: {
          select: {
            name: true,
            image: true,
            banner: true,
            color: true,
            memberOnTeam: {
              select: {
                teamId: true,
                team: {
                  select: {
                    image: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    getAuthSession(),
  ]);
  if (!manga) return notFound();

  const creatorTeam = manga.creator.memberOnTeam;

  return (
    <Tabs defaultValue="chapter">
      <TabsList>
        <TabsTrigger value="chapter">Chapter</TabsTrigger>
        <TabsTrigger value="comment">Bình luận</TabsTrigger>
      </TabsList>

      <TabsContent
        forceMount
        value="chapter"
        className="grid grid-cols-1 lg:grid-cols-[.35fr_1fr] gap-6 data-[state='inactive']:hidden"
      >
        <div className="space-y-6">
          <div className="p-2 rounded-md dark:bg-zinc-900/60">
            <a
              target="_blank"
              href={`/user/${manga.creator.name?.split(' ').join('-')}`}
            >
              <div className="relative">
                <UserBanner
                  user={manga.creator}
                  className="object-cover rounded-md"
                />
                <UserAvatar
                  user={manga.creator}
                  className="absolute bottom-0 translate-y-1/2 left-4 border-4 w-20 h-20 lg:w-[5.5rem] lg:h-[5.5rem]"
                />
              </div>
              <Username
                user={manga.creator}
                className="text-start mt-14 lg:mt-16 pl-4 text-lg lg:text-xl font-semibold"
              />
            </a>
            {!!creatorTeam && (
              <a
                target="_blank"
                href={`/team/${creatorTeam.teamId}`}
                className="flex items-center gap-3 p-2 mt-10 rounded-md transition-colors dark:bg-zinc-800 hover:dark:bg-zinc-800/70"
              >
                <div className="relative aspect-square w-12 h-12">
                  <Image
                    fill
                    sizes="(max-width: 640px) 15vw, 20vw"
                    quality={40}
                    src={creatorTeam.team.image}
                    alt={`${creatorTeam.team.name} Thumbnail`}
                    className="rounded-full"
                  />
                </div>
                <p>{creatorTeam.team.name}</p>
              </a>
            )}
          </div>

          {!!manga.facebookLink && (
            <FBEmbed facebookLink={manga.facebookLink} />
          )}

          <DiscEmbed manga={manga} />
        </div>

        <Tabs defaultValue="list">
          <div className="md:w-full md:flex md:justify-end">
            <TabsList className="space-x-2 dark:bg-zinc-800 max-sm:grid max-sm:grid-cols-2">
              <TabsTrigger value="list">
                <List
                  className="max-sm:w-5 max-sm:h-5"
                  aria-label="List chapter button"
                />
              </TabsTrigger>
              <TabsTrigger value="group">
                <ListTree
                  className="max-sm:w-5 max-sm:h-5"
                  aria-label="List tree chapter button"
                />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            forceMount
            value="list"
            className="data-[state='inactive']:hidden"
          >
            <ListChapter mangaId={Manga.id} />
          </TabsContent>

          <TabsContent
            forceMount
            value="group"
            className="data-[state='inactive']:hidden"
          >
            <ListTreeChapter mangaId={Manga.id} />
          </TabsContent>
        </Tabs>
      </TabsContent>

      <TabsContent
        forceMount
        value="comment"
        className='data-[state="inactive"]:hidden space-y-12'
      >
        <Comments id={Manga.id} session={session} />
      </TabsContent>
    </Tabs>
  );
};

export default MangaTabs;
