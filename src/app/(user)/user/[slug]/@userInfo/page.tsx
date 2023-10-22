import MangaCard from '@/components/Manga/components/MangaCard';
import Username from '@/components/User/Username';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { db } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';

interface defaultProps {
  params: {
    slug: string;
  };
}

const Default: FC<defaultProps> = async ({ params }) => {
  const user = await db.user.findUnique({
    where: {
      name: params.slug.split('-').join(' '),
    },
    select: {
      following: {
        select: {
          id: true,
          name: true,
          color: true,
          image: true,
        },
      },
      followedBy: {
        select: {
          id: true,
          name: true,
          color: true,
          image: true,
        },
      },
      manga: {
        where: {
          isPublished: true,
        },
        select: {
          id: true,
          slug: true,
          name: true,
          image: true,
          review: true,
          chapter: {
            take: 3,
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              volume: true,
              chapterIndex: true,
              name: true,
              createdAt: true,
            },
          },
        },
      },
      subForum: {
        select: {
          slug: true,
          banner: true,
          title: true,
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      },
    },
  });
  if (!user) return notFound();

  return (
    <Tabs defaultValue="manga">
      <TabsList className="justify-start max-w-full overflow-auto">
        <TabsTrigger value="manga">Manga</TabsTrigger>
        <TabsTrigger value="forum">Forum</TabsTrigger>
        <TabsTrigger value="followedBy">Người theo dõi</TabsTrigger>
        <TabsTrigger value="following">Đang theo dõi</TabsTrigger>
      </TabsList>

      <TabsContent
        value="manga"
        forceMount
        className="data-[state=inactive]:hidden grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[650px] overflow-auto scrollbar dark:scrollbar--dark"
      >
        {!!user.manga.length ? (
          user.manga.map((manga) => <MangaCard key={manga.id} manga={manga} />)
        ) : (
          <p>Người dùng này chưa đăng Manga nào</p>
        )}
      </TabsContent>

      <TabsContent
        value="forum"
        forceMount
        className="data-[state=inactive]:hidden space-y-4 max-h-[650px] overflow-auto scrollbar dark:scrollbar--dark"
      >
        {!!user.subForum.length ? (
          user.subForum.map((forum) => (
            <a
              key={forum.slug}
              target="_blank"
              href={`${process.env.NEXT_PUBLIC_FORUM_URL}/${forum.slug}`}
              className="grid grid-cols-[.7fr_1fr] lg:grid-cols-[.3fr_1fr] gap-6 p-2 rounded-md transition-colors hover:dark:bg-zinc-800"
            >
              {!!forum.banner && (
                <div className="relative aspect-video">
                  <Image
                    fill
                    sizes="(max-width: 640px) 20vw, 25"
                    quality={40}
                    src={forum.banner}
                    alt={`${forum.title} Banner`}
                    className="rounded-md"
                  />
                </div>
              )}

              <div className="lg:space-y-2">
                <p className="text-xl font-semibold">{forum.title}</p>
                <dl className="text-sm flex items-center gap-1.5">
                  <dt>{forum._count.subscriptions}</dt>
                  <dd>Member</dd>
                </dl>
              </div>
            </a>
          ))
        ) : (
          <p>Người dùng này chưa tạo Forum nào</p>
        )}
      </TabsContent>

      <TabsContent
        value="followedBy"
        className="data-[state=inactive]:hidden space-y-4 max-h-[650px] overflow-auto scrollbar dark:scrollbar--dark"
      >
        {!!user.followedBy.length ? (
          user.followedBy.map((usr) => (
            <Link
              key={usr.id}
              href={`/user/${usr.name?.split(' ').join('-')}`}
              className="grid grid-cols-[.4fr_1fr] lg:grid-cols-[.2fr_1fr] gap-5 lg:gap-6 p-2 rounded-md transition-colors hover:dark:bg-zinc-800"
            >
              {!!usr.image && (
                <div className="relative aspect-square">
                  <Image
                    fill
                    sizes="(max-width: 640px) 20vw 25vw"
                    quality={40}
                    src={usr.image}
                    alt={`${usr.name} Avatar`}
                    className="rounded-full object-cover"
                  />
                </div>
              )}

              <Username
                user={usr}
                className="text-start text-xl font-semibold"
              />
            </Link>
          ))
        ) : (
          <p>Chưa có ai theo dõi người dùng này</p>
        )}
      </TabsContent>

      <TabsContent
        value="following"
        className="data-[state=inactive]:hidden space-y-4 max-h-[650px] overflow-auto scrollbar dark:scrollbar--dark"
      >
        {!!user.following.length ? (
          user.following.map((usr) => (
            <Link
              key={usr.id}
              href={`/user/${usr.name?.split(' ').join('-')}`}
              className="grid grid-cols-[.4fr_1fr] lg:grid-cols-[.2fr_1fr] gap-5 lg:gap-6 p-2 rounded-md transition-colors hover:dark:bg-zinc-800"
            >
              {!!usr.image && (
                <div className="relative aspect-square">
                  <Image
                    fill
                    sizes="(max-width: 640px) 20vw 25vw"
                    quality={40}
                    src={usr.image}
                    alt={`${usr.name} Avatar`}
                    className="rounded-full object-cover"
                  />
                </div>
              )}

              <Username
                user={usr}
                className="text-start text-xl font-semibold"
              />
            </Link>
          ))
        ) : (
          <p>Người dùng này chưa theo dõi ai</p>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default Default;
