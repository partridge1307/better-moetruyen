import ListChapter from '@/components/Chapter/ListChapter';
import ListTreeChapter from '@/components/Chapter/ListTreeChapter';
import EditorOutput from '@/components/EditorOutput';
import FBEmbed from '@/components/FBEmbed';
import MangaImage from '@/components/MangaImage';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { TagContent, TagWrapper } from '@/components/ui/Tag';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { List, ListTree, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FC, Suspense, lazy } from 'react';
const MoetruyenEditor = lazy(
  () => import('@/components/Editor/MoetruyenEditor')
);
const CommentOutput = lazy(() => import('@/components/Comment/CommentOutput'));

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

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (!params.id)
    return {
      title: 'Moetruyen',
      description: 'Powered by Yuri',
    };
  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
    },
    select: {
      name: true,
    },
  });
  if (!manga)
    return {
      title: 'Moetruyen',
      description: 'Powered by Yuri',
    };

  return {
    title: `Đọc ${manga.name} - Moetruyen`,
    description: `Đọc ${manga.name} tại Moetruyen`,
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const manga = await db.manga.findFirst({
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
      creator: {
        select: {
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
      view: {
        select: {
          totalView: true,
        },
      },
    },
  });
  if (!manga) return notFound();

  const comments = await db.comment.findMany({
    where: {
      mangaId: manga.id,
      replyToId: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      content: true,
      oEmbed: true,
      createdAt: true,
      authorId: true,
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
    take: INFINITE_SCROLL_PAGINATION_RESULTS,
  });

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
      <div className="container max-sm:px-2 mx-auto h-full pt-20 space-y-14">
        <div className="relative h-max">
          <div className="p-4 max-sm:space-y-4 md:flex md:gap-10">
            <MangaImage className="h-48 w-full md:w-40" image={manga.image} />

            <div className="space-y-1 md:space-y-2">
              <p className="text-2xl md:text-4xl font-semibold">{manga.name}</p>
              <p className="text-sm">
                {manga.author.map((a) => a.name).join(', ')}
              </p>
            </div>
          </div>

          <div className="absolute inset-0 -z-10">
            <div className="relative h-full w-full">
              <Image
                fill
                priority
                sizes="0%"
                src={manga.image}
                alt="Manga Background Image"
                className="object-cover blur-sm brightness-[.2] md:brightness-[.3] rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="p-3 md:p-6 space-y-10 dark:bg-zinc-900/80 rounded-md">
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

          <dl className="flex gap-2">
            <dt>Lượt xem:</dt>
            <dd className="font-medium">{manga.view?.totalView}</dd>
          </dl>

          <div className="space-y-2">
            <p className="font-semibold text-lg">Mô tả</p>
            <EditorOutput content={manga.description} />
          </div>

          <Tabs defaultValue="chapter">
            <TabsList className="space-x-2 dark:bg-zinc-800">
              <TabsTrigger value="chapter">Chapter</TabsTrigger>
              <TabsTrigger value="comment">Bình luận</TabsTrigger>
            </TabsList>
            <TabsContent
              value="chapter"
              className="grid grid-cols-1 max-sm:gap-20 md:grid-cols-[.4fr_1fr] lg:grid-cols-[.3fr_1fr] gap-6"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-lg px-2 w-full">Uploader</p>
                  <Card className="relative bg-transparent/10">
                    <CardHeader className="max-sm:gap-12">
                      <div className="relative">
                        {manga.creator.image && (
                          <div
                            className={cn(
                              'h-[5rem] w-[5rem] border-[6px] rounded-full z-10',
                              manga.creator.banner
                                ? 'absolute top-2/3 left-2'
                                : 'mx-auto'
                            )}
                          >
                            <div className="relative w-full h-full">
                              <Image
                                fill
                                src={manga.creator.image}
                                alt="User Avatar"
                                className="rounded-full"
                              />
                            </div>
                          </div>
                        )}
                        {manga.creator.banner && (
                          <div className="relative w-full h-32 rounded-md">
                            <Image
                              fill
                              sizes="0%"
                              src={manga.creator.banner}
                              alt="User Banner"
                              className="rounded-md"
                            />
                          </div>
                        )}
                      </div>

                      <p
                        className={cn(
                          'md:text-center font-semibold text-lg',
                          manga.creator.banner && 'text-center ml-3 md:ml-10'
                        )}
                        style={{
                          color: manga.creator.color ? manga.creator.color : '',
                        }}
                      >
                        {manga.creator.name}
                      </p>
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
                  <FBEmbed facebookLink={manga.facebookLink} />
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
                  <Suspense
                    fallback={<Loader2 className="w-6 h-6 animate-spin" />}
                  >
                    <ListTreeChapter mangaId={manga.id} />
                  </Suspense>
                </TabsContent>

                <TabsContent value="list">
                  <Suspense
                    fallback={<Loader2 className="w-6 h-6 animate-spin" />}
                  >
                    <ListChapter mangaId={manga.id} />
                  </Suspense>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="comment">
              <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin" />}>
                <MoetruyenEditor id={params.id} />
                <CommentOutput initialComments={comments} id={params.id} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default page;
