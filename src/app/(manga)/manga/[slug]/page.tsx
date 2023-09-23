import MangaControllSkeleton from '@/components/Skeleton/MangaControllSkeleton';
import MangaDescSkeleton from '@/components/Skeleton/MangaDescSkeleton';
import MangaTabsSkeleton from '@/components/Skeleton/MangaTabsSkeleton';
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
    loading: () => (
      <div
        className="rounded-md animate-pulse dark:bg-zinc-900"
        style={{ aspectRatio: 4 / 3 }}
      />
    ),
  }
);
const MangaControll = dynamic(
  () => import('@/components/Manga/components/MangaControll'),
  {
    loading: () => <MangaControllSkeleton />,
  }
);
const MangaDesc = dynamic(
  () => import('@/components/Manga/components/MangaDesc'),
  { ssr: false, loading: () => <MangaDescSkeleton /> }
);
const MangaTabs = dynamic(
  () => import('@/components/Manga/components/MangaTabs'),
  {
    loading: () => <MangaTabsSkeleton />,
  }
);

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
      slug: true,
      name: true,
      image: true,
      description: true,
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
      <main className="container max-sm:px-2 mx-auto space-y-10 mb-10">
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
            className="-z-10 object-cover rounded-md brightness-[.3] blur-sm"
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

          <MangaTabs Manga={manga} />
        </section>
      </main>
    </>
  );
};

export default page;
