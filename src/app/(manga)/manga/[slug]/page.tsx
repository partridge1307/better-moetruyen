import ChapterList from '@/components/Chapter/ChapterList';
import MangaImage from '@/components/Manga/components/MangaImage';
import DescriptionSkeleton from '@/components/Skeleton/DescriptionSkeleton';
import UserAvatar from '@/components/User/UserAvatar';
import UserBanner from '@/components/User/UserBanner';
import Username from '@/components/User/Username';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { TagContent, TagWrapper } from '@/components/ui/Tag';
import { db } from '@/lib/db';
import { nFormatter } from '@/lib/utils';
import type { Manga } from '@prisma/client';
import { Bookmark, Eye, MessageSquare, Pen } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const MangaAction = dynamic(() => import('@/components/Manga/MangaAction'));
const DiscordEmbed = dynamic(() => import('@/components/DiscordEmbed'));
const FacebookEmbed = dynamic(() => import('@/components/FacebookEmbed'));
const MangaInfo = dynamic(
  () => import('@/components/Manga/components/MangaInfo'),
  {
    ssr: false,
    loading: () => <MangaInfoSkeleton />,
  }
);

interface pageProps {
  params: {
    slug: string;
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
      slug: true,
      name: true,
      altName: true,
      cover: true,
      image: true,
      description: true,
      facebookLink: true,
      discordLink: true,
      creator: {
        select: {
          name: true,
          color: true,
          image: true,
          banner: true,
          manga: {
            take: 3,
            where: {
              isPublished: true,
              NOT: {
                slug: params.slug,
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              slug: true,
              image: true,
              name: true,
              review: true,
            },
          },
        },
      },
      author: {
        select: {
          name: true,
        },
      },
      view: {
        select: {
          totalView: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          description: true,
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

  const jsonLd = generateJsonLd(manga, params.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container px-0 pb-4 bg-gradient-to-t from-background">
        {/* Manga cover section */}
        <section className="relative aspect-[4/2] md:aspect-[4/1]">
          {!!manga.cover ? (
            <Image
              fill
              priority
              sizes="(max-width: 640px) 45vw, 65vw"
              quality={40}
              src={manga.cover}
              alt={`${manga.name} Cover`}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary-foreground" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background md:hidden" />
        </section>

        {/* Manga image section */}
        <section className="-translate-y-1/2 px-2 mx-2 md:px-6 md:mx-10 grid grid-cols-[.6fr_1fr] md:grid-cols-[.3fr_1fr] lg:grid-cols-[.2fr_1fr] gap-6">
          <MangaImage manga={manga} className="ring-4 ring-foreground" />

          <div className="grid grid-rows-[1fr_.7fr] md:grid-rows-[1fr_.8fr_auto]">
            <div className="max-sm:hidden" />

            <h1 className="text-xl md:text-4xl lg:text-5xl md:mt-1.5 max-sm:max-h-16 max-sm:active:max-h-none max-sm:leading-5 overflow-hidden font-semibold">
              {manga.name}
            </h1>

            <ul className="flex flex-wrap gap-3 md:gap-4">
              <li className="max-sm:order-last">
                <Popover>
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
                <Bookmark className="w-5 h-5" />{' '}
                {nFormatter(manga._count.followedBy, 1)}
              </li>

              <li className="flex items-center gap-1.5">
                <Eye className="w-5 h-5" />{' '}
                {nFormatter(manga.view?.totalView!, 1)}
              </li>

              <li className="flex items-center gap-1.5">
                <MessageSquare className="w-5 h-5" />{' '}
                {nFormatter(manga._count.comment, 1)}
              </li>
            </ul>
          </div>
        </section>

        {/* Action section */}
        <section className="-mt-14 md:-mt-24 lg:-mt-[6.5rem] px-2 mx-1 md:px-6 md:mx-9 flex items-center gap-5">
          <MangaAction manga={manga} />
        </section>

        {/* Info section */}
        <section className="mx-1 md:px-4 md:mx-9 mt-6 md:mt-7 space-y-8">
          <TagWrapper className="px-2">
            {manga.tags.map((tag) => (
              <TagContent key={tag.id} title={tag.description}>
                {tag.name}
              </TagContent>
            ))}
          </TagWrapper>

          <div className="grid md:grid-cols-[1fr_.35fr] gap-6">
            <div className="p-2 rounded-md md:bg-primary-foreground/95">
              <MangaInfo manga={manga} />
            </div>

            <div className="p-2 rounded-md md:bg-primary-foreground/95">
              <Accordion type="multiple" defaultValue={['other']}>
                <AccordionItem value="other">
                  <AccordionTrigger>Cùng người đăng</AccordionTrigger>
                  <AccordionContent asChild>
                    <ul className="space-y-3">
                      {manga.creator.manga.map((otherManga) => (
                        <li key={otherManga.id}>
                          <Link
                            href={`/manga/${otherManga.slug}`}
                            className="grid grid-cols-[.3fr_1fr] gap-3 transition-colors rounded-md group hover:bg-zinc-800"
                          >
                            <MangaImage
                              manga={otherManga}
                              sizes="(max-width: 640px) 22vw, 10vw"
                              className="transition-transform group-hover:scale-105"
                            />

                            <div className="space-y-0.5">
                              <p className="text-lg font-semibold">
                                {otherManga.name}
                              </p>
                              <p className="line-clamp-3">
                                {otherManga.review}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {!!manga.facebookLink && (
                  <AccordionItem value="facebook">
                    <AccordionTrigger>Facebook</AccordionTrigger>
                    <AccordionContent>
                      <FacebookEmbed facebookLink={manga.facebookLink} />
                    </AccordionContent>
                  </AccordionItem>
                )}

                {!!manga.discordLink && (
                  <AccordionItem value="discord">
                    <AccordionTrigger>Discord</AccordionTrigger>
                    <AccordionContent>
                      <DiscordEmbed discordLink={manga.discordLink} />
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Chapter section */}
        <section className="mx-1 md:px-4 md:mx-9 mt-8">
          <div className="p-2 md:p-4 rounded-lg bg-primary-foreground/95">
            <ChapterList manga={manga} />
          </div>
        </section>
      </main>
    </>
  );
};

export default page;

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
      altName: true,
      image: true,
      chapter: {
        take: 1,
        orderBy: {
          chapterIndex: 'desc',
        },
        select: {
          chapterIndex: true,
        },
      },
    },
  });
  if (!manga)
    return {
      title: `Manga ${params.slug}`,
      description: `Đọc Manga ${params.slug} | Moetruyen`,
      alternates: {
        canonical: `${process.env.NEXTAUTH_URL}/manga/${params.slug}`,
      },
    };

  const title = `${manga.name} - Tới chap ${manga.chapter[0]?.chapterIndex}`;
  const description = !!manga.altName.length
    ? `Đọc truyện ${manga.name}, ${manga.altName.join(', ')} | Moetruyen`
    : `Đọc truyện ${manga.name} | Moetruyen`;

  return {
    title: {
      default: title,
      absolute: title,
    },
    description,
    keywords: [`Manga`, `${manga.name}`, 'Moetruyen', ...manga.altName],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/manga/${manga.slug}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/manga/${manga.slug}`,
      siteName: 'Moetruyen',
      title,
      description,
      locale: 'vi_VN',
      images: [
        {
          url: manga.image,
          alt: `Ảnh bìa ${manga.name}`,
        },
      ],
    },
    twitter: {
      site: 'Moetruyen',
      title,
      description,
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
      width: 1280,
      height: 960,
    },
  };
}

function MangaInfoSkeleton() {
  return (
    <div className="space-y-6">
      <DescriptionSkeleton />

      <div className="space-y-1">
        <p className="text-lg font-semibold">Tác giả</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
          {Array.from(Array(3).keys()).map((_, idx) => (
            <div
              key={idx}
              className="h-7 rounded-md bg-muted"
              style={{
                width: `${Math.round(Math.random() * (idx + 4)) + 6}rem`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-lg font-semibold">Tên khác</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
          {Array.from(Array(3).keys()).map((_, idx) => (
            <div
              key={idx}
              className="h-7 rounded-md bg-muted"
              style={{
                width: `${Math.round(Math.random() * (idx + 4)) + 6}rem`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
