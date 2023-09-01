import ListChapter from '@/components/Chapter/ListChapter';
import CommentSkeleton from '@/components/Comment/components/CommentSkeleton';
import MangaDesc from '@/components/Manga/components/MangaDesc';
import UserAvatar from '@/components/User/UserAvatar';
import UserBanner from '@/components/User/UserBanner';
import Username from '@/components/User/Username';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { TagContent, TagWrapper } from '@/components/ui/Tag';
import { db } from '@/lib/db';
import type { Manga } from '@prisma/client';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const MangaImage = dynamic(
  () => import('@/components/Manga/components/MangaImage'),
  {
    ssr: false,
  }
);
const MangaControll = dynamic(
  () => import('@/components/Manga/components/MangaControll')
);
const DiscEmbed = dynamic(() => import('@/components/DiscEmbed'));
const FBEmbed = dynamic(() => import('@/components/FBEmbed'), {
  ssr: false,
});
const Comments = dynamic(() => import('@/components/Comment/Manga'), {
  ssr: false,
  loading: () => <CommentSkeleton />,
});

interface pageProps {
  params: {
    slug: string;
  };
}

function generateJsonLd(manga: Pick<Manga, 'name' | 'image'>, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: `${process.env.NEXTAUTH_URL}/manga/${slug}`,
    headline: `${manga.name}`,
    description: `Đọc ${manga.name} | Moetruyen`,
    image: {
      '@type': 'ImageObject',
      url: `${manga.image}`,
      height: 904,
      width: 696,
    },
  };
}

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  const manga = await db.manga.findFirst({
    where: {
      slug: params.slug,
    },
    select: {
      slug: true,
      name: true,
      image: true,
    },
  });
  if (!manga)
    return {
      title: 'Manga',
      description: 'Đọc Manga | Moetruyen',
      alternates: {
        canonical: `${process.env.NEXTAUTH_URL}/manga/${params.slug}`,
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
      canonical: `${process.env.NEXTAUTH_URL}/manga/${manga.slug}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/manga/${manga.slug}`,
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
  const manga = await db.manga.findUnique({
    where: {
      slug: params.slug,
      isPublished: true,
    },
    select: {
      id: true,
      name: true,
      image: true,
      description: true,
      facebookLink: true,
      discordLink: true,
      creatorId: true,
      tags: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      author: {
        select: {
          name: true,
        },
      },
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

  const jsonLd = generateJsonLd(manga, params.slug);
  const creatorTeam = manga.creator.memberOnTeam;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container max-sm:px-2 mx-auto pt-20 space-y-10">
        <section className="relative grid grid-cols-2 lg:grid-cols-[.3fr_1fr] gap-3 lg:gap-4 p-2">
          <MangaImage manga={manga} />
          <div className="space-y-2">
            <h1 className="text-lg lg:text-2xl font-semibold">{manga.name}</h1>
            <p>{manga.author.map((author) => author.name).join(', ')}</p>
          </div>
          <Image
            fill
            sizes="10vw"
            quality={10}
            priority
            src={manga.image}
            alt={`${manga.name} Thumbnail`}
            className="-z-10 object-cover object-top rounded-md brightness-[.3] blur-sm"
          />
        </section>

        <section className="p-2 pb-10 space-y-10 rounded-md dark:bg-zinc-900/60">
          <MangaControll manga={manga} />

          <div className="space-y-2">
            <h1 className="text-lg lg:text-xl font-semibold">Thể loại</h1>
            <TagWrapper>
              {manga.tags.map((tag) => (
                <TagContent key={tag.id} title={tag.description}>
                  {tag.name}
                </TagContent>
              ))}
            </TagWrapper>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <p>
              {manga.view?.totalView} <span>lượt xem</span>
            </p>
            <p>
              {manga._count.mangaFollow} <span>theo dõi</span>
            </p>
          </div>

          <div>
            <h1 className="text-lg lg:text-xl font-semibold">Mô tả</h1>
            <MangaDesc manga={manga} />
          </div>

          <Tabs defaultValue="chapter">
            <TabsList>
              <TabsTrigger value="chapter">Chapter</TabsTrigger>
              <TabsTrigger value="comment">Bình luận</TabsTrigger>
            </TabsList>

            <TabsContent
              value="chapter"
              className="grid grid-cols-1 lg:grid-cols-[.35fr_1fr] gap-6"
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
                      href={`/team/${creatorTeam.team.id}`}
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

              <ListChapter mangaId={manga.id} />
            </TabsContent>

            <TabsContent value="comment">
              <Comments id={manga.id} />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </>
  );
};

export default page;
