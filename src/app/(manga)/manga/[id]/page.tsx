import CommentSkeleton from '@/components/Comment/components/CommentSkeleton';
import UserAvatar from '@/components/User/UserAvatar';
import UserBanner from '@/components/User/UserBanner';
import Username from '@/components/User/Username';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { TagContent, TagWrapper } from '@/components/ui/Tag';
import { db } from '@/lib/db';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const MangaControll = dynamic(() => import('@/components/Manga/MangaControll'));
const ListChapter = dynamic(() => import('@/components/Chapter/ListChapter'));
const Comments = dynamic(() => import('@/components/Comment/Manga'), {
  ssr: false,
  loading: () => <CommentSkeleton />,
});
const FBEmbed = dynamic(() => import('@/components/FBEmbed'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-md dark:bg-zinc-900 animate-pulse" />
  ),
});
const MangaImage = dynamic(() => import('@/components/Manga/MangaImage'), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full md:w-40 dark:bg-zinc-900 animate-pulse" />
  ),
});
const MTEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  { ssr: false }
);

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
}: pageProps): Promise<Metadata> {
  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });
  if (!manga)
    return {
      title: 'Manga',
      description: 'Đọc Manga | Moetruyen',
      alternates: {
        canonical: `${process.env.NEXTAUTH_URL}/manga/${params.id}`,
      },
    };

  return {
    title: {
      default: manga.name,
      absolute: manga.name,
    },
    description: `Đọc ${manga.name} | Moetruyen`,
    keywords: [`Manga`, `${manga.name}`, 'Moetruyen'],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/manga/${manga.id}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/manga/${manga.id}`,
      siteName: 'Moetruyen',
      title: manga.name,
      description: `Đọc ${manga.name} tại Moetruyen`,
      images: [
        {
          url: manga.image,
          alt: `Ảnh bìa ${manga.name}`,
        },
      ],
    },
    twitter: {
      site: 'Moetruyen',
      title: manga.name,
      description: `Đọc ${manga.name} | Moetruyen`,
      card: 'summary_large_image',
      images: [
        {
          url: manga.image,
          alt: `Ảnh bìa ${manga.name}`,
        },
      ],
    },
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
  });
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: `${process.env.NEXTAUTH_URL}/manga/${params.id}`,
    headline: `${manga.name}`,
    description: `Đọc ${manga.name} | Moetruyen`,
    image: {
      '@type': 'ImageObject',
      url: `${manga.image}`,
      height: 904,
      width: 696,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container max-sm:px-2 mx-auto h-full pt-20 space-y-14">
        <div className="relative h-max">
          <div className="p-4 max-sm:space-y-4 md:flex md:gap-10">
            <MangaImage className="h-48 w-full md:w-40" manga={manga} />

            <div className="space-y-1 md:space-y-2">
              <p className="text-2xl md:text-4xl font-semibold">{manga.name}</p>
              <p className="text-sm">
                {manga.author.map((a) => a.name).join(', ')}
              </p>
            </div>
          </div>

          <Image
            fill
            sizes="(max-width: 648px) 25vw, 30vw"
            quality={40}
            priority
            src={manga.image}
            alt="Manga Background Image"
            className="absolute inset-0 -z-10 h-full w-full blur-sm brightness-[.3] object-cover rounded-md"
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
            <MTEditorOutput id={manga.id} content={manga.description} />
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
                  <h1 className="text-lg px-2 w-full">Uploader</h1>

                  <div className="relative p-2 border dark:bg-zinc-900">
                    <Link
                      href={`/user/${manga.creator.name?.split(' ').join('-')}`}
                    >
                      <div className="relative">
                        <UserBanner user={manga.creator} className="rounded" />
                        <UserAvatar
                          user={manga.creator}
                          className="w-20 h-20 lg:w-24 lg:h-24 border-4 absolute left-2 bottom-0 translate-y-1/2"
                        />
                      </div>

                      <Username
                        user={manga.creator}
                        className="text-start text-lg font-semibold pl-2 mt-14"
                      />
                    </Link>

                    {!!manga.creator.memberOnTeam && (
                      <Link
                        href={`/team/${
                          manga.creator.memberOnTeam.team.id
                        }/${manga.creator.memberOnTeam.team.name
                          .split(' ')
                          .join('-')}`}
                      >
                        <div className="flex gap-2 items-center mt-8">
                          <div className="relative w-12 h-12">
                            <Image
                              fill
                              sizes="50vw"
                              src={manga.creator.memberOnTeam.team.image}
                              alt={`${manga.creator.memberOnTeam.team.name} Image`}
                              className="rounded-full border-2"
                            />
                          </div>
                          <h2>{manga.creator.memberOnTeam.team.name}</h2>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>

                {manga.facebookLink && (
                  <FBEmbed facebookLink={manga.facebookLink} />
                )}

                {discord.code && (
                  <div className="p-1">
                    <h1 className="text-lg px-1 w-full">
                      Discord:{' '}
                      <span className="font-semibold">{discord.name}</span>
                    </h1>
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

              <ListChapter mangaId={manga.id} />
            </TabsContent>

            <TabsContent value="comment">
              <Comments id={manga.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default page;
