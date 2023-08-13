import UserAvatar from '@/components/User/UserAvatar';
import UserBanner from '@/components/User/UserBanner';
import Username from '@/components/User/Username';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { TagContent, TagWrapper } from '@/components/ui/Tag';
import { db } from '@/lib/db';
import { List, ListTree } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FC, Suspense, lazy } from 'react';
import type { Metadata } from 'next';

const MangaControll = dynamic(() => import('@/components/Manga/MangaControll'));
const ListTreeChapter = dynamic(
  () => import('@/components/Chapter/ListTreeChapter')
);
const ListChapter = dynamic(() => import('@/components/Chapter/ListChapter'));
const Comment = lazy(() => import('@/components/Comment'));
const EditorOutput = lazy(() => import('@/components/EditorOutput'));
const FBEmbed = lazy(() => import('@/components/FBEmbed'));
const MangaImage = lazy(() => import('@/components/Manga/MangaImage'));

interface pageProps {
  params: {
    id: string;
  };
}

type discordProps = {
  code: boolean;
  id?: string;
  name?: string;
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
    },
    select: {
      id: true,
      name: true,
      review: true,
    },
  });
  if (!manga)
    return {
      title: 'Manga',
      openGraph: {
        title: 'Manga | Moetruyen',
        description: 'Manga | Moetruyen',
      },
      twitter: {
        title: 'Manga | Moetruyen',
        description: 'Manga | Moetruyen',
      },
    };

  return {
    title: `Đọc ${manga.name}`,
    description: `${manga.review} | Moetruyen`,
    keywords: [`Manga`, `${manga.name}`, 'Moetruyen'],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/manga/${manga.id}`,
    },
    openGraph: {
      title: `Đọc ${manga.name} | Moetruyen`,
      description: `${manga.review} | Moetruyen`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Đọc ${manga.name} | Moetruyen`,
      description: `${manga.review} | Moetruyen`,
    },
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const [manga, comments] = await db.$transaction([
    db.manga.findFirst({
      where: {
        id: +params.id,
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        image: true,
        description: true,
        facebookLink: true,
        discordLink: true,
        author: true,
        tags: true,
        _count: {
          select: {
            mangaFollow: true,
          },
        },
        view: {
          select: {
            totalView: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            banner: true,
            color: true,
            memberOnTeam: {
              select: {
                team: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    db.comment.findMany({
      where: {
        mangaId: +params.id,
        replyToId: null,
      },
      select: {
        id: true,
        content: true,
        oEmbed: true,
        createdAt: true,
        authorId: true,
        chapter: {
          select: {
            id: true,
            chapterIndex: true,
          },
        },
        author: {
          select: {
            name: true,
            image: true,
            color: true,
          },
        },
        votes: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),
  ]);
  if (!manga) return notFound();

  let discord: discordProps = { code: false };
  if (manga.discordLink) {
    try {
      const data = await (
        await fetch(
          `https://discord.com/api/v10/invites/${manga.discordLink
            .split('/')
            .pop()}`,
          {
            cache: 'force-cache',
          }
        )
      ).json();

      if (data.code === 10006) discord.code = false;
      discord.code = true;
      discord.id = data.guild.id;
      discord.name = data.guild.name;
    } catch (error) {
      discord.code = false;
    }
  }

  return (
    <>
      <main className="container max-sm:px-2 mx-auto h-full pt-20 space-y-14">
        <div className="relative h-max">
          <div className="p-4 max-sm:space-y-4 md:flex md:gap-10">
            <Suspense
              fallback={
                <template className="h-48 w-full md:w-40 dark:bg-zinc-900 animate-pulse" />
              }
            >
              <MangaImage className="h-48 w-full md:w-40" manga={manga} />
            </Suspense>

            <div className="space-y-1 md:space-y-2">
              <p className="text-2xl md:text-4xl font-semibold">{manga.name}</p>
              <p className="text-sm">
                {manga.author.map((a) => a.name).join(', ')}
              </p>
            </div>
          </div>

          <Image
            width={500}
            height={300}
            quality={50}
            priority
            src={manga.image}
            alt="Manga Background Image"
            className="absolute inset-0 -z-10 h-full w-full blur-sm brightness-[.2] md:brightness-[.3] object-cover rounded-md"
          />
        </div>

        <div className="p-3 md:p-6 space-y-10 dark:bg-zinc-900/80 rounded-md">
          <MangaControll manga={manga} />

          <div className="space-y-1">
            <p className="font-semibold text-lg">Thể loại</p>
            <TagWrapper>
              {manga.tags.map((tag, idx) => (
                <TagContent
                  key={idx}
                  title={`${tag.description ? tag.description : tag.name}`}
                >
                  {tag.name}
                </TagContent>
              ))}
            </TagWrapper>
          </div>

          <div className="flex gap-6">
            <p>
              <span>Lượt xem:</span> {manga.view?.totalView}
            </p>
            <p>
              <span>Theo dõi:</span> {manga._count.mangaFollow}
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-lg">Mô tả</p>
            <Suspense
              fallback={
                <template className="w-full h-20 p-2 rounded-md dark:bg-zinc-900 animate-pulse" />
              }
            >
              <EditorOutput data={manga.description} />
            </Suspense>
          </div>

          <Tabs defaultValue="chapter">
            <TabsList className="space-x-2 dark:bg-zinc-800">
              <TabsTrigger value="chapter">Chapter</TabsTrigger>
              <TabsTrigger value="comment">Bình luận</TabsTrigger>
            </TabsList>
            <TabsContent
              value="chapter"
              className="grid grid-cols-1 md:grid-cols-[.4fr_1fr] lg:grid-cols-[.3fr_1fr] gap-6 max-sm:gap-20 mb-2"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-lg px-2 w-full">Uploader</p>
                  <Card className="relative bg-transparent/10">
                    <CardHeader className="max-sm:gap-12 p-2">
                      <div className="relative md:mb-10">
                        <UserBanner user={manga.creator} className="rounded" />
                        <UserAvatar
                          user={manga.creator}
                          className="absolute top-1/2 translate-y-1/3 translate-x-2 w-20 h-20 border-4"
                        />
                      </div>

                      <Username
                        user={manga.creator}
                        className="text-lg text-start"
                      />
                    </CardHeader>
                    {manga.creator.memberOnTeam && (
                      <CardContent>
                        <div className="flex px-2 gap-3">
                          {manga.creator.memberOnTeam.team.image && (
                            <div className="relative w-10 h-10">
                              <Image
                                fill
                                sizes="0%"
                                src={manga.creator.memberOnTeam.team.image}
                                alt="Team Image"
                                className="rounded-full"
                              />
                            </div>
                          )}
                          <p className="text-lg font-semibold">
                            {manga.creator.memberOnTeam.team.name}
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>

                {manga.facebookLink && (
                  <Suspense
                    fallback={
                      <template className="w-full h-[300px] rounded-md dark:bg-zinc-900 animate-pulse" />
                    }
                  >
                    <FBEmbed facebookLink={manga.facebookLink} />
                  </Suspense>
                )}

                {discord.code && (
                  <div className="p-1">
                    <p className="text-lg px-1 w-full">
                      Discord:{' '}
                      <span className="font-semibold">{discord.name}</span>
                    </p>
                    <iframe
                      height={300}
                      src={`https://discord.com/widget?id=${discord.id}&theme=dark`}
                      allowFullScreen
                      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                      className="w-full border dark:border-zinc-700 rounded-md"
                    />
                  </div>
                )}
              </div>

              <Tabs defaultValue="list">
                <div className="md:w-full md:flex md:justify-end">
                  <TabsList className="space-x-2 dark:bg-zinc-800 max-sm:grid max-sm:grid-cols-2">
                    <TabsTrigger value="list">
                      <List className="max-sm:w-5 max-sm:h-5" />
                    </TabsTrigger>
                    <TabsTrigger value="group">
                      <ListTree className="max-sm:w-5 max-sm:h-5" />
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="group">
                  <ListTreeChapter mangaId={manga.id} />
                </TabsContent>

                <TabsContent value="list">
                  <ListChapter mangaId={manga.id} />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="comment">
              <Suspense
                fallback={
                  <template className="grid grid-cols-1 grid-rows-[.7fr_1fr] gap-20 dark:bg-zinc-900 animate-pulse" />
                }
              >
                <Comment id={params.id} initialComments={comments} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default page;
